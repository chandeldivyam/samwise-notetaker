'use client'

import { Button, Card, Form, Input, Space, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login, signup } from './actions'
import styles from './login.module.css'

const { Title } = Typography

export default function LoginPage() {
  const [form] = Form.useForm()

  const handleSubmit = async (action: typeof login | typeof signup) => {
    try {
      const values = await form.validateFields()
      await action(values)
    } catch (error) {
      console.error('Form submission failed:', error)
    }
  }

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <Title level={2} className={styles.title}>
          Welcome to Samwise
        </Title>
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              type="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                onClick={() => handleSubmit(login)}
              >
                Log in
              </Button>
              <Button
                block
                onClick={() => handleSubmit(signup)}
              >
                Sign up
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}