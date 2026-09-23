import { env } from '../../config/environment';
import { logger } from '../../config/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export const emailService = {
  /**
   * Send email using configured provider
   * Supports: SendGrid, AWS SES, SMTP
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    const provider = env.EMAIL_PROVIDER || 'smtp';
    
    logger.info({ to: options.to, subject: options.subject, provider }, 'Sending email');
    
    try {
      if (provider === 'sendgrid') {
        await this.sendViaSendGrid(options);
      } else if (provider === 'ses') {
        await this.sendViaSES(options);
      } else {
        await this.sendViaSMTP(options);
      }
      
      logger.info({ to: options.to }, 'Email sent successfully');
    } catch (error) {
      logger.error({ error, to: options.to }, 'Failed to send email');
      throw error;
    }
  },
  
  async sendViaSendGrid(options: EmailOptions): Promise<void> {
    const apiKey = env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY not configured');
    }
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(options.to)
              ? options.to.map((email) => ({ email }))
              : [{ email: options.to }],
          },
        ],
        from: {
          email: env.EMAIL_FROM || 'notifications@veribot.ai',
          name: 'VeriBot',
        },
        subject: options.subject,
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`);
    }
  },
  
  async sendViaSES(options: EmailOptions): Promise<void> {
    // AWS SES integration would go here
    // For now, throw an error
    throw new Error('AWS SES not yet implemented');
  },
  
  async sendViaSMTP(options: EmailOptions): Promise<void> {
    // SMTP integration would go here
    // For now, just log
    logger.warn('SMTP email sending not implemented, email not sent');
  },
  
  /**
   * Send test failure notification
   */
  async sendTestFailureEmail(
    to: string,
    data: {
      projectName: string;
      testRunId: string;
      failedCount: number;
      passedCount: number;
      totalCount: number;
      failedTests: Array<{ title: string; errorMessage?: string }>;
      testRunUrl: string;
    }
  ): Promise<void> {
    const subject = `❌ Test Failure: ${data.failedCount} test${data.failedCount > 1 ? 's' : ''} failed in ${data.projectName}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { color: #666; font-size: 14px; }
    .failed-tests { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .test-item { padding: 10px; border-left: 3px solid #dc2626; margin-bottom: 10px; background: #fff5f5; }
    .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">❌ Test Failure Alert</h1>
      <p style="margin:5px 0 0 0;">Project: ${data.projectName}</p>
    </div>
    <div class="content">
      <div class="stats">
        <div class="stat">
          <div class="stat-value" style="color: #dc2626;">${data.failedCount}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #16a34a;">${data.passedCount}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat">
          <div class="stat-value">${data.totalCount}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      
      <div class="failed-tests">
        <h3>Failed Tests:</h3>
        ${data.failedTests
          .slice(0, 5)
          .map(
            (test) => `
          <div class="test-item">
            <strong>${test.title}</strong>
            ${test.errorMessage ? `<p style="margin:5px 0 0 0; color:#666; font-size:14px;">${test.errorMessage}</p>` : ''}
          </div>
        `
          )
          .join('')}
        ${data.failedTests.length > 5 ? `<p><em>...and ${data.failedTests.length - 5} more tests</em></p>` : ''}
      </div>
      
      <center>
        <a href="${data.testRunUrl}" class="button">View Full Test Results</a>
      </center>
    </div>
    <div class="footer">
      <p>This is an automated notification from VeriBot</p>
      <p>You're receiving this because you're subscribed to test notifications for ${data.projectName}</p>
    </div>
  </div>
</body>
</html>
    `;
    
    await this.sendEmail({ to, subject, html });
  },
  
  /**
   * Send test success notification
   */
  async sendTestSuccessEmail(
    to: string,
    data: {
      projectName: string;
      totalCount: number;
      duration: number;
      testRunUrl: string;
    }
  ): Promise<void> {
    const subject = `✅ All Tests Passed: ${data.projectName}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #16a34a; }
    .stat-label { color: #666; font-size: 14px; }
    .button { display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">✅ All Tests Passed!</h1>
      <p style="margin:5px 0 0 0;">Project: ${data.projectName}</p>
    </div>
    <div class="content">
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${data.totalCount}</div>
          <div class="stat-label">Tests Passed</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Math.round(data.duration / 1000)}s</div>
          <div class="stat-label">Duration</div>
        </div>
      </div>
      
      <p style="text-align:center; font-size:18px;">🎉 Great job! All tests are passing.</p>
      
      <center>
        <a href="${data.testRunUrl}" class="button">View Test Results</a>
      </center>
    </div>
    <div class="footer">
      <p>This is an automated notification from VeriBot</p>
    </div>
  </div>
</body>
</html>
    `;
    
    await this.sendEmail({ to, subject, html });
  },
  
  /**
   * Send bug notification
   */
  async sendBugCreatedEmail(
    to: string,
    data: {
      bugTitle: string;
      severity: string;
      priority: string;
      projectName: string;
      bugUrl: string;
      description?: string;
    }
  ): Promise<void> {
    const subject = `🐛 New ${data.severity} Bug: ${data.bugTitle}`;
    
    const severityColor: Record<string, string> = {
      CRITICAL: '#dc2626',
      HIGH: '#ea580c',
      MEDIUM: '#eab308',
      LOW: '#16a34a',
    };
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${severityColor[data.severity] || '#666'}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .badge { display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; margin-right: 10px; }
    .severity { background: ${severityColor[data.severity] || '#666'}; color: white; }
    .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">🐛 New Bug Detected</h1>
      <p style="margin:5px 0 0 0;">Project: ${data.projectName}</p>
    </div>
    <div class="content">
      <h2>${data.bugTitle}</h2>
      <div>
        <span class="badge severity">${data.severity}</span>
        <span class="badge" style="background:#f3f4f6; color:#111;">Priority: ${data.priority}</span>
      </div>
      ${data.description ? `<p style="margin-top:20px;">${data.description}</p>` : ''}
      
      <center>
        <a href="${data.bugUrl}" class="button">View Bug Details</a>
      </center>
    </div>
    <div class="footer">
      <p>This is an automated notification from VeriBot</p>
    </div>
  </div>
</body>
</html>
    `;
    
    await this.sendEmail({ to, subject, html });
  },
};
