// src/utils/s3.ts
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
	region: process.env.NEXT_PUBLIC_AWS_REGION!,
	credentials: {
		accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
	},
});

const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

export async function generateS3Key(userId: string, fileType: string) {
	const uuid = uuidv4();
	const extension = fileType.split('/')[1];
	return `${userId}/recordings/${uuid}.${extension}`;
}

export async function uploadToS3(file: File, key: string) {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const command = new PutObjectCommand({
			Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
			Key: key,
			Body: buffer,
			ContentType: file.type,
			ServerSideEncryption: 'AES256',
		});

		await s3Client.send(command);
		return { success: true };
	} catch (error) {
		console.error('Error uploading to S3:', error);
		return { error: 'Failed to upload file' };
	}
}

export async function deleteFromS3(key: string) {
	try {
		const command = new DeleteObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME!,
			Key: key,
		});

		await s3Client.send(command);
		return { success: true };
	} catch (error) {
		console.error('Error deleting from S3:', error);
		return { error: 'Failed to delete file' };
	}
}

export async function getSignedUrl(key: string) {
	try {
		const command = new GetObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME!,
			Key: key,
		});

		const url = await getS3SignedUrl(s3Client, command, {
			expiresIn: SIGNED_URL_EXPIRY,
		});
		return { url };
	} catch (error) {
		console.error('Error getting signed URL:', error);
		return { error: 'Failed to get signed URL' };
	}
}
