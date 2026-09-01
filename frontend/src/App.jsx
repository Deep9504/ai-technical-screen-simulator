import { useState, useRef, useEffect } from 'react';
import { Layout, Typography, Input, Button, Card, Space, Avatar } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import './App.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Used to automatically scroll to the newest message
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage = { role: 'user', content: inputValue };
    const updatedChatHistory = [...messages, newUserMessage];
    
    setMessages(updatedChatHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ai-technical-screen-simulator.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: updatedChatHistory }) 
      });

      const data = await response.json();
      
      const aiMessage = { role: 'ai', content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error connecting to backend", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <RobotOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '10px' }} />
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>AI Technical Interviewer</Title>
      </Header>
      
      <Content style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <Card 
          style={{ flex: 1, marginBottom: '20px', display: 'flex', flexDirection: 'column', height: '65vh' }}
          styles={{ body: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' } }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', marginTop: '100px' }}>
              <RobotOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <p>Start the interview by typing "Hello, I am ready!"</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <Avatar 
                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                style={{ backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a' }}
              />
              <div 
                style={{
                  backgroundColor: msg.role === 'user' ? '#1890ff' : '#f5f5f5',
                  color: msg.role === 'user' ? '#fff' : '#000',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  borderTopRightRadius: msg.role === 'user' ? '0' : '8px',
                  borderTopLeftRadius: msg.role === 'user' ? '8px' : '0',
                  maxWidth: '75%',
                  wordWrap: 'break-word'
                }}
              >
                <Text style={{ color: 'inherit' }}>{msg.content}</Text>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
              <div style={{ backgroundColor: '#f5f5f5', padding: '12px 16px', borderRadius: '0 8px 8px 8px' }}>
                <Text type="secondary">Interviewer is typing...</Text>
              </div>
            </div>
          )}
          {/* This empty div is the target for the auto-scroll */}
          <div ref={chatEndRef} />
        </Card>

        <Space.Compact style={{ width: '100%' }} size="large">
          <Input 
            placeholder="Type your answer here..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            disabled={isLoading}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSendMessage} 
            loading={isLoading}
          >
            Send
          </Button>
        </Space.Compact>
      </Content>
    </Layout>
  );
}

export default App;