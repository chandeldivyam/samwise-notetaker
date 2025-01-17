// ./src/app/dashboard/people/PeopleList.tsx
'use client';

import { useState } from 'react';
import { Button, Table, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Person } from '@/types/person';
import { deletePerson } from '@/lib/actions/people';
import { useMessage, showSuccess, showError } from '@/utils/message';

interface PeopleListProps {
    initialPeople: Person[];
}

export default function PeopleList({ initialPeople }: PeopleListProps) {
    const [people, setPeople] = useState(initialPeople);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();
    const message = useMessage();

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const { error } = await deletePerson(id);
            if (error) {
                showError(message, `Failed to delete person: ${error}`);
                return;
            }

            showSuccess(message, 'Person deleted successfully');
            setPeople(people.filter((person) => person.id !== id));
            router.refresh();
        } catch (error) {
            showError(message, 'An unexpected error occurred while deleting the person');
            console.error('Error:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (record: Person) => {
        router.push(`/dashboard/people/${record.id}`);
    };

    const handleMouseOver = (path: string) => {
        router.prefetch(path);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Person) => (
                <div
                    className="cursor-pointer text-primary hover:underline"
                    onClick={() => handleEdit(record)}
                    onMouseEnter={() => handleMouseOver(`/dashboard/people/${record.id}`)}
                >
                    {text}
                </div>
            ),
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (updated_at: string) =>
                new Date(updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: string[]) => (
                <Space size={[0, 8]} wrap>
                    {tags.map((tag) => (
                        <Tag key={tag} className="m-0">
                            {tag}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Person) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        type="text"
                        onClick={() => handleEdit(record)}
                        onMouseEnter={() => handleMouseOver(`/dashboard/people/${record.id}`)}
                    />
                    <Popconfirm
                        title="Delete this person"
                        description="Are you sure you want to delete this person?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        disabled={deletingId === record.id}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            type="text"
                            danger
                            loading={deletingId === record.id}
                            disabled={deletingId === record.id}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-end items-center mb-8">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => router.push('/dashboard/people/new')}
                        onMouseEnter={() => handleMouseOver('/dashboard/people/new')}
                    >
                        New Person
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={people.map((person) => ({
                        ...person,
                        key: person.id,
                    }))}
                    locale={{ emptyText: 'No people yet' }}
                />
            </div>
        </div>
    );
}