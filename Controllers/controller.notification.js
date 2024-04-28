const Notification = require('../Models/Notification');

async function createNotification(recipientId, type, message, jobId, applicantId) {
    try {
        const notification = new Notification({
            recipientId,
            type,
            message,
            jobId,
            applicantId
        });
        await notification.save();
        console.log('Notification created successfully.');
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

const getNotificationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ recipientId: userId }).sort({ timestamp: -1 });

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications by user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const markNotificationsAsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;
        await Notification.updateMany(
            { _id: { $in: notificationIds } },
            { $set: { read: true } }
        );
        res.status(200).send({ message: 'Notifications marked as read successfully' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}

module.exports = {
    createNotification,
    getNotificationsByUserId,
    markNotificationsAsRead
};