import { whatsappSettings } from '../routes/settings';

export interface WhatsAppMessage {
  to: string;
  message: string;
  adminName?: string;
  dueDate?: string;
  workerName?: string;
  orderTitle?: string;
}

export class WhatsAppService {
  private static instance: WhatsAppService;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Send WhatsApp message for order assignment
   */
  public async sendOrderAssignmentMessage(params: WhatsAppMessage): Promise<boolean> {
    try {
      // Check if WhatsApp messaging is enabled
      if (!whatsappSettings.isEnabled) {
        console.log('WhatsApp messaging is disabled');
        return false;
      }

      // Validate recipient number
      if (!params.to || !this.isValidPhoneNumber(params.to)) {
        console.error('Invalid recipient phone number:', params.to);
        return false;
      }

      // Format the message using template
      const formattedMessage = this.formatMessage(
        whatsappSettings.messageTemplate,
        params
      );

      // For now, we'll log the message (in production, integrate with WhatsApp Business API)
      console.log('📱 WhatsApp Message would be sent:');
      console.log(`From: ${whatsappSettings.adminWhatsAppNumber}`);
      console.log(`To: ${params.to}`);
      console.log(`Message: ${formattedMessage}`);

      // TODO: Integrate with actual WhatsApp Business API
      // Example integration options:
      // 1. WhatsApp Business API (Official)
      // 2. Twilio WhatsApp API
      // 3. 360Dialog
      // 4. Chatfuel
      
      // Simulate API call
      await this.simulateWhatsAppAPI(params.to, formattedMessage);

      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Format message template with actual values
   */
  private formatMessage(template: string, params: WhatsAppMessage): string {
    return template
      .replace(/\[Admin Name\]/g, params.adminName || 'Admin')
      .replace(/\[Due Date\]/g, params.dueDate || 'Not specified')
      .replace(/\[Worker Name\]/g, params.workerName || 'Team Member')
      .replace(/\[Order Title\]/g, params.orderTitle || 'New Order');
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Basic validation for international format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Simulate WhatsApp API call (replace with actual API integration)
   */
  private async simulateWhatsAppAPI(to: string, message: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would be replaced with actual API calls like:
    
    // Example with Twilio WhatsApp API:
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   from: `whatsapp:${whatsappSettings.adminWhatsAppNumber}`,
    //   to: `whatsapp:${to}`,
    //   body: message
    // });

    // Example with WhatsApp Business API:
    // const response = await fetch('https://graph.facebook.com/v17.0/PHONE_NUMBER_ID/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: to,
    //     text: { body: message }
    //   })
    // });

    console.log(`✅ WhatsApp message simulated successfully to ${to}`);
  }

  /**
   * Test WhatsApp configuration
   */
  public async testConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      if (!whatsappSettings.isEnabled) {
        return { success: false, message: 'WhatsApp messaging is disabled' };
      }

      if (!this.isValidPhoneNumber(whatsappSettings.adminWhatsAppNumber)) {
        return { success: false, message: 'Invalid admin WhatsApp number format' };
      }

      // Test message
      const testMessage = 'This is a test message from MT Web Experts system.';
      console.log(`🧪 Testing WhatsApp configuration with message: ${testMessage}`);
      
      // Simulate test
      await this.simulateWhatsAppAPI(whatsappSettings.adminWhatsAppNumber, testMessage);

      return { success: true, message: 'WhatsApp configuration test successful' };
    } catch (error) {
      return { success: false, message: `Configuration test failed: ${error}` };
    }
  }
}

export default WhatsAppService.getInstance();
