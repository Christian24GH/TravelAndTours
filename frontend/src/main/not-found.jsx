import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router';

export default function NotFound(){
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <Label style={{ marginBottom: '1rem' }}>
                Looks like you've wandered too far
            </Label>
            <Button style={{ marginBottom: '0.5rem' }} onClick={() => navigate(-1)}>
                Go Back to previous location
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
                Go Home
            </Button>
        </motion.div>
    )
}