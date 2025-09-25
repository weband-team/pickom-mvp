import React from 'react';
import { Avatar, AvatarProps, Badge, BadgeProps } from '@mui/material';
import { Person, LocalShipping } from '@mui/icons-material';

export interface UserAvatarProps extends Omit<AvatarProps, 'children'> {
  type?: 'customer' | 'picker';
  src?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
  badgeColor?: BadgeProps['color'];
  online?: boolean;
}

const sizeMap = {
  small: 32,
  medium: 40,
  large: 56,
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  type = 'customer',
  src,
  name,
  size = 'medium',
  showBadge = false,
  badgeColor = 'primary',
  online = false,
  ...props
}) => {
  const avatarSize = sizeMap[size];

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getIcon = () => {
    return type === 'picker' ? <LocalShipping /> : <Person />;
  };

  const avatar = (
    <Avatar
      src={src}
      {...props}
      sx={{
        width: avatarSize,
        height: avatarSize,
        backgroundColor: '#f5f5f5',
        color: '#000000',
        border: online ? '2px solid #4caf50' : 'none',
        ...props.sx,
      }}
    >
      {src ? null : name ? getInitials(name) : getIcon()}
    </Avatar>
  );

  if (showBadge) {
    return (
      <Badge
        color={badgeColor}
        variant="dot"
        overlap="circular"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {avatar}
      </Badge>
    );
  }

  return avatar;
};