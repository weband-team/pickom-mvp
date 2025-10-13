import { Avatar } from '@mui/material'
import { useRouter } from 'next/navigation'

interface UserAvatarProps{
    avatarUrl?: string;
    name: string;
    sx?: object; 
}

export function UserAvatar(props: UserAvatarProps){
    const { name, avatarUrl, sx } = props;
    const router = useRouter()
    return (
    <Avatar 
      src={avatarUrl}
      sx={{
        width: 40,
        height: 40,
        cursor: 'pointer',
        '&:hover': {
            transform: 'scale(1.05)',
            opacity: 0.8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }, 
        ...sx,
      }}
      onClick={() => router.push('/profile')}
    >
      {name[0]}
    </Avatar>
  );
}