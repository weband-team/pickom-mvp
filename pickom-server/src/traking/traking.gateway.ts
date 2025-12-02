import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrakingService } from './traking.service';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/auth/guards/ws-auth.guard';

interface LocationUpdate {
  deliveryId: number;
  lat: number;
  lng: number;
  userId: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URI || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/tracking',
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Store client connections by delivery ID
  private deliveryRooms = new Map<number, Set<string>>();

  constructor(private readonly trackingService: TrakingService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up rooms
    this.deliveryRooms.forEach((clients, deliveryId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.deliveryRooms.delete(deliveryId);
      }
    });
  }

  @SubscribeMessage('join-tracking')
  async handleJoinTracking(
    @MessageBody() data: { deliveryId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { deliveryId, userId } = data;

    // Check access
    const hasAccess = await this.trackingService.hasAccess(deliveryId, userId);
    if (!hasAccess) {
      client.emit('error', {
        message: 'Access denied to this tracking session',
      });
      return;
    }

    // Join room
    const roomName = `delivery-${deliveryId}`;
    client.join(roomName);

    // Track in memory
    if (!this.deliveryRooms.has(deliveryId)) {
      this.deliveryRooms.set(deliveryId, new Set());
    }
    this.deliveryRooms.get(deliveryId)!.add(client.id);

    // Send current tracking data
    const tracking =
      await this.trackingService.getTrackingByDeliveryId(deliveryId);
    if (tracking) {
      client.emit('tracking-data', tracking);
    }

    console.log(
      `Client ${client.id} joined tracking for delivery ${deliveryId}`,
    );
  }

  @SubscribeMessage('leave-tracking')
  handleLeaveTracking(
    @MessageBody() data: { deliveryId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { deliveryId } = data;
    const roomName = `delivery-${deliveryId}`;
    client.leave(roomName);

    // Remove from memory
    const clients = this.deliveryRooms.get(deliveryId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.deliveryRooms.delete(deliveryId);
      }
    }

    console.log(`Client ${client.id} left tracking for delivery ${deliveryId}`);
  }

  @SubscribeMessage('update-location')
  async handleLocationUpdate(
    @MessageBody() data: LocationUpdate,
    @ConnectedSocket() client: Socket,
  ) {
    const { deliveryId, lat, lng, userId } = data;

    try {
      // Verify this user is the picker
      const tracking =
        await this.trackingService.getTrackingByDeliveryId(deliveryId);
      if (!tracking || tracking.pickerId !== userId) {
        client.emit('error', {
          message: 'Only the picker can update location',
        });
        return;
      }

      // Update location in database
      const updatedTracking = await this.trackingService.updatePickerLocation(
        deliveryId,
        { lat, lng },
      );

      // Broadcast to all clients in the room
      const roomName = `delivery-${deliveryId}`;
      this.server.to(roomName).emit('location-updated', {
        deliveryId,
        pickerLocation: updatedTracking.pickerLocation,
      });

      console.log(`Location updated for delivery ${deliveryId}:`, { lat, lng });
    } catch (error) {
      client.emit('error', {
        message: 'Failed to update location',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('update-status')
  async handleStatusUpdate(
    @MessageBody()
    data: {
      deliveryId: number;
      status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
      userId: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { deliveryId, status, userId } = data;

    try {
      // Verify this user is the picker
      const tracking =
        await this.trackingService.getTrackingByDeliveryId(deliveryId);
      if (!tracking || tracking.pickerId !== userId) {
        client.emit('error', {
          message: 'Only the picker can update status',
        });
        return;
      }

      // Update status
      const updatedTracking = await this.trackingService.updateStatus(
        deliveryId,
        status,
      );

      // Broadcast to all clients
      const roomName = `delivery-${deliveryId}`;
      this.server.to(roomName).emit('status-updated', {
        deliveryId,
        status: updatedTracking.status,
      });

      // If delivered, notify tracking is complete (but don't delete for history)
      if (status === 'delivered') {
        this.server.to(roomName).emit('tracking-completed', { deliveryId });
        console.log(`Tracking completed for delivered order ${deliveryId}`);
      }

      console.log(`Status updated for delivery ${deliveryId}:`, status);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to update status',
        error: error.message,
      });
    }
  }
}
