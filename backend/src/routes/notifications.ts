import { Router, Request, Response } from 'express';
import { sessionMiddleware } from '@/middleware/auth.middleware';
import { notificationService } from '@/services/notification-service';
import { createLogger } from '@/utils/logger';

const logger = createLogger('NotificationRoutes');

const router = Router();

/**
 * Get notifications for authenticated merchant
 * GET /api/notifications
 */
router.get('/', sessionMiddleware, async (req: Request, res: Response) => {
  try {
    const merchantId = req.merchant?.id;
    if (!merchantId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Merchant ID not found' 
      });
    }

    const {
      status,
      type,
      limit = '20',
      page = '1'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const result = await notificationService.getInAppNotifications(merchantId, {
      status: status as any,
      type: type as any,
      limit: limitNum,
      skip,
    });

    res.json({
      success: true,
      data: {
        notifications: result.notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          pages: Math.ceil(result.total / limitNum),
        },
        unreadCount: result.unreadCount,
      },
    });

  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
});

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Merchant ID not found' 
      });
    }

    const unreadCount = await notificationService.getUnreadNotificationCount(merchantId);

    res.json({
      success: true,
      data: { unreadCount },
    });

  } catch (error) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
});

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Merchant ID not found' 
      });
    }

    const { id } = req.params;
    const notification = await notificationService.markNotificationAsRead(merchantId, id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: { notification },
    });

  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put('/read-all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Merchant ID not found' 
      });
    }

    const count = await notificationService.markAllNotificationsAsRead(merchantId);

    res.json({
      success: true,
      data: { 
        message: `${count} notifications marked as read`,
        count 
      },
    });

  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Merchant ID not found' 
      });
    }

    const { id } = req.params;
    const deleted = await notificationService.deleteNotification(merchantId, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: { message: 'Notification deleted successfully' },
    });

  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

/**
 * Create test notification (for development)
 * POST /api/notifications/test
 */
router.post('/test', authenticateToken, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Merchant ID not found' 
      });
    }

    const { type = 'payment_received', urgency = 'medium' } = req.body;

    // Create test notification
    const result = await notificationService.sendMerchantNotification(merchantId, {
      type,
      urgency: urgency as any,
      amount: 5000, // $50.00
      currency: 'USD',
      paymentId: 'test_payment_123',
      channels: ['in_app'],
    });

    res.json({
      success: true,
      data: { 
        message: 'Test notification sent',
        result 
      },
    });

  } catch (error) {
    logger.error('Error creating test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test notification',
    });
  }
});

export default router;
