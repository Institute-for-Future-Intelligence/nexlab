import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Tooltip } from '@mui/material';

interface NavigationCardProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  lockIcon?: boolean;
  className?: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  onClick,
  disabled = false,
  disabledTooltip,
  lockIcon = false,
  className = "menu-item"
}) => {
  const cardContent = (
    <Card className={className}>
      <CardActionArea onClick={onClick} disabled={disabled}>
        <CardContent>
          <Typography 
            className="menu-item-typography" 
            variant="h6" 
            component="div"
            sx={disabled ? { color: '#9e9e9e', opacity: 0.5 } : {}}
          >
            {title}
            {lockIcon && <span style={{ marginLeft: 8 }}>🔒</span>}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  if (disabled && disabledTooltip) {
    return (
      <Tooltip title={disabledTooltip}>
        <span>{cardContent}</span>
      </Tooltip>
    );
  }

  return cardContent;
};

export default NavigationCard; 