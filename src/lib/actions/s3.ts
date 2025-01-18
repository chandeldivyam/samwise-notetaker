// src/lib/actions/s3.ts
'use server';

import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

export async function generateUploadUrl(
	userId: string,
	fileType: string,
	contentType: string
) {
	try {
		const uuid = uuidv4();
		const extension = fileType.split('/')[1];
		const key = `${userId}/${contentType}/${uuid}.${extension}`;

		const command = new PutObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME!,
			Key: key,
			ContentType: fileType,
			ServerSideEncryption: 'AES256',
		});

		const url = await getSignedUrl(s3Client, command, {
			expiresIn: 3600,
		});

		return { url, key };
	} catch (error) {
		console.error('Error generating upload URL:', error);
		return { error: 'Failed to generate upload URL' };
	}
}

export async function getS3SignedUrl(key: string) {
	try {
		const command = new GetObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME!,
			Key: key,
		});

		const url = await getSignedUrl(s3Client, command, {
			expiresIn: 3600, // URL expires in 1 hour
		});

		return { url };
	} catch (error) {
		console.error('Error generating signed URL:', error);
		return { error: 'Failed to generate signed URL' };
	}
}

export async function deleteS3Object(key: string) {
	try {
		const command = new DeleteObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME!,
			Key: key,
		});

		await s3Client.send(command);
		console.log('S3 object deleted:', key);
		return { success: true };
	} catch (error) {
		console.error('Error deleting S3 object:', error);
		return { error: 'Failed to delete S3 object' };
	}
}

export async function getPublicUrl(key: string) {
	return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
