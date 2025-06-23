import axios from "axios";
import { storage } from "./storage";

// Google APIs Integration
export class GoogleIntegration {
  private apiKey: string;
  private refreshToken: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || "";
    this.refreshToken = process.env.GOOGLE_REFRESH_TOKEN || "";
  }

  // Google Calendar Integration
  async createCalendarEvent(eventData: {
    summary: string;
    description: string;
    startTime: string;
    endTime: string;
    attendees?: string[];
  }) {
    try {
      const response = await axios.post(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        {
          summary: eventData.summary,
          description: eventData.description,
          start: { dateTime: eventData.startTime },
          end: { dateTime: eventData.endTime },
          attendees: eventData.attendees?.map(email => ({ email }))
        },
        {
          headers: {
            Authorization: `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Google Calendar error:", error);
      return null;
    }
  }

  // Google Drive Integration
  async uploadToGoogleDrive(fileName: string, content: string, mimeType: string) {
    try {
      const response = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          name: fileName,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root']
        },
        {
          headers: {
            Authorization: `Bearer ${await this.getAccessToken()}`,
            'Content-Type': mimeType
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Google Drive error:", error);
      return null;
    }
  }

  // Google Sheets Integration
  async appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
    try {
      const response = await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append`,
        {
          range,
          majorDimension: "ROWS",
          values
        },
        {
          params: { valueInputOption: "RAW" },
          headers: {
            Authorization: `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Google Sheets error:", error);
      return null;
    }
  }

  private async getAccessToken(): Promise<string> {
    // In a real implementation, this would refresh the access token using the refresh token
    return process.env.GOOGLE_ACCESS_TOKEN || "";
  }
}

// Slack Integration
export class SlackIntegration {
  private webhookUrl: string;
  private botToken: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || "";
    this.botToken = process.env.SLACK_BOT_TOKEN || "";
  }

  async sendMessage(channel: string, text: string, attachments?: any[]) {
    try {
      const response = await axios.post('https://slack.com/api/chat.postMessage', {
        channel,
        text,
        attachments
      }, {
        headers: {
          Authorization: `Bearer ${this.botToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Slack error:", error);
      return null;
    }
  }

  async sendWebhook(message: string, channel?: string) {
    try {
      const response = await axios.post(this.webhookUrl, {
        text: message,
        channel: channel || "#general"
      });
      return response.data;
    } catch (error) {
      console.error("Slack webhook error:", error);
      return null;
    }
  }
}

// Zapier Integration
export class ZapierIntegration {
  async triggerZap(zapHookUrl: string, data: any) {
    try {
      const response = await axios.post(zapHookUrl, data);
      return response.data;
    } catch (error) {
      console.error("Zapier error:", error);
      return null;
    }
  }
}

// HubSpot CRM Integration
export class HubSpotIntegration {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY || "";
  }

  async createContact(contactData: {
    email: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    phone?: string;
  }) {
    try {
      const response = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/contacts',
        {
          properties: contactData
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("HubSpot error:", error);
      return null;
    }
  }

  async createDeal(dealData: {
    dealname: string;
    amount?: number;
    dealstage?: string;
    pipeline?: string;
  }) {
    try {
      const response = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/deals',
        {
          properties: dealData
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("HubSpot deal error:", error);
      return null;
    }
  }
}

// Salesforce Integration
export class SalesforceIntegration {
  private instanceUrl: string;
  private accessToken: string;

  constructor() {
    this.instanceUrl = process.env.SALESFORCE_INSTANCE_URL || "";
    this.accessToken = process.env.SALESFORCE_ACCESS_TOKEN || "";
  }

  async createLead(leadData: {
    FirstName?: string;
    LastName: string;
    Email: string;
    Company: string;
    Phone?: string;
    Status?: string;
  }) {
    try {
      const response = await axios.post(
        `${this.instanceUrl}/services/data/v58.0/sobjects/Lead/`,
        leadData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Salesforce error:", error);
      return null;
    }
  }
}

// Mailchimp Integration
export class MailchimpIntegration {
  private apiKey: string;
  private serverPrefix: string;

  constructor() {
    this.apiKey = process.env.MAILCHIMP_API_KEY || "";
    this.serverPrefix = this.apiKey.split('-')[1] || "";
  }

  async addToMailingList(listId: string, email: string, firstName?: string, lastName?: string) {
    try {
      const response = await axios.post(
        `https://${this.serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`,
        {
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: firstName || "",
            LNAME: lastName || ""
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Mailchimp error:", error);
      return null;
    }
  }
}

// Microsoft Teams Integration
export class TeamsIntegration {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.TEAMS_WEBHOOK_URL || "";
  }

  async sendMessage(title: string, text: string, themeColor?: string) {
    try {
      const response = await axios.post(this.webhookUrl, {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        summary: title,
        themeColor: themeColor || "0076D7",
        sections: [{
          activityTitle: title,
          activityText: text
        }]
      });
      return response.data;
    } catch (error) {
      console.error("Teams error:", error);
      return null;
    }
  }
}

// Twilio SMS Integration
export class TwilioIntegration {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || "";
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || "";
  }

  async sendSMS(to: string, message: string) {
    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        new URLSearchParams({
          To: to,
          From: this.fromNumber,
          Body: message
        }),
        {
          auth: {
            username: this.accountSid,
            password: this.authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Twilio error:", error);
      return null;
    }
  }
}

// Integration Manager
export class IntegrationManager {
  private google: GoogleIntegration;
  private slack: SlackIntegration;
  private zapier: ZapierIntegration;
  private hubspot: HubSpotIntegration;
  private salesforce: SalesforceIntegration;
  private mailchimp: MailchimpIntegration;
  private teams: TeamsIntegration;
  private twilio: TwilioIntegration;

  constructor() {
    this.google = new GoogleIntegration();
    this.slack = new SlackIntegration();
    this.zapier = new ZapierIntegration();
    this.hubspot = new HubSpotIntegration();
    this.salesforce = new SalesforceIntegration();
    this.mailchimp = new MailchimpIntegration();
    this.teams = new TeamsIntegration();
    this.twilio = new TwilioIntegration();
  }

  // Process new contact submission through all integrations
  async processNewContact(contactData: any) {
    const results: any = {};

    // Create HubSpot contact
    if (process.env.HUBSPOT_API_KEY) {
      results.hubspot = await this.hubspot.createContact({
        email: contactData.email,
        firstname: contactData.name.split(' ')[0],
        lastname: contactData.name.split(' ').slice(1).join(' '),
        company: contactData.company,
        phone: contactData.phone
      });
    }

    // Create Salesforce lead
    if (process.env.SALESFORCE_ACCESS_TOKEN) {
      results.salesforce = await this.salesforce.createLead({
        FirstName: contactData.name.split(' ')[0],
        LastName: contactData.name.split(' ').slice(1).join(' ') || 'Unknown',
        Email: contactData.email,
        Company: contactData.company || 'Unknown',
        Phone: contactData.phone,
        Status: 'New'
      });
    }

    // Add to Mailchimp
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
      results.mailchimp = await this.mailchimp.addToMailingList(
        process.env.MAILCHIMP_LIST_ID,
        contactData.email,
        contactData.name.split(' ')[0],
        contactData.name.split(' ').slice(1).join(' ')
      );
    }

    // Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      results.slack = await this.slack.sendWebhook(
        `🔔 New contact submission from ${contactData.name} (${contactData.email})\nCompany: ${contactData.company}\nMessage: ${contactData.message}`
      );
    }

    // Send Teams notification
    if (process.env.TEAMS_WEBHOOK_URL) {
      results.teams = await this.teams.sendMessage(
        "New Contact Submission",
        `**${contactData.name}** from **${contactData.company}** has submitted a contact form.\n\n**Email:** ${contactData.email}\n**Phone:** ${contactData.phone || 'N/A'}\n\n**Message:** ${contactData.message}`,
        "28A745"
      );
    }

    // Create Google Calendar event for follow-up
    if (process.env.GOOGLE_ACCESS_TOKEN) {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 1);
      followUpDate.setHours(9, 0, 0, 0);

      results.calendar = await this.google.createCalendarEvent({
        summary: `Follow up: ${contactData.name}`,
        description: `Follow up with ${contactData.name} from ${contactData.company}\nEmail: ${contactData.email}\nOriginal message: ${contactData.message}`,
        startTime: followUpDate.toISOString(),
        endTime: new Date(followUpDate.getTime() + 30 * 60 * 1000).toISOString()
      });
    }

    // Log to Google Sheets
    if (process.env.GOOGLE_SHEETS_ID) {
      results.sheets = await this.google.appendToSheet(
        process.env.GOOGLE_SHEETS_ID,
        'A:F',
        [[
          new Date().toISOString(),
          contactData.name,
          contactData.email,
          contactData.company || '',
          contactData.phone || '',
          contactData.message
        ]]
      );
    }

    // Trigger Zapier webhook
    if (process.env.ZAPIER_WEBHOOK_URL) {
      results.zapier = await this.zapier.triggerZap(process.env.ZAPIER_WEBHOOK_URL, {
        type: 'new_contact',
        data: contactData,
        timestamp: new Date().toISOString()
      });
    }

    return results;
  }

  // Process new client creation
  async processNewClient(clientData: any) {
    const results: any = {};

    // Send SMS notification to admin
    if (process.env.TWILIO_PHONE_NUMBER && process.env.ADMIN_PHONE) {
      results.sms = await this.twilio.sendSMS(
        process.env.ADMIN_PHONE,
        `New client added: ${clientData.name} from ${clientData.company}`
      );
    }

    // Create HubSpot company
    if (process.env.HUBSPOT_API_KEY) {
      results.hubspot = await this.hubspot.createContact({
        email: clientData.email,
        firstname: clientData.name.split(' ')[0],
        lastname: clientData.name.split(' ').slice(1).join(' '),
        company: clientData.company
      });
    }

    return results;
  }

  // Get integration status
  getIntegrationStatus() {
    return {
      google: {
        enabled: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_ACCESS_TOKEN),
        services: ['Calendar', 'Drive', 'Sheets']
      },
      slack: {
        enabled: !!(process.env.SLACK_WEBHOOK_URL || process.env.SLACK_BOT_TOKEN),
        services: ['Messages', 'Webhooks']
      },
      hubspot: {
        enabled: !!process.env.HUBSPOT_API_KEY,
        services: ['Contacts', 'Deals']
      },
      salesforce: {
        enabled: !!(process.env.SALESFORCE_INSTANCE_URL && process.env.SALESFORCE_ACCESS_TOKEN),
        services: ['Leads', 'Opportunities']
      },
      mailchimp: {
        enabled: !!process.env.MAILCHIMP_API_KEY,
        services: ['Mailing Lists']
      },
      teams: {
        enabled: !!process.env.TEAMS_WEBHOOK_URL,
        services: ['Messages']
      },
      twilio: {
        enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        services: ['SMS', 'Voice']
      },
      n8n: {
        enabled: !!process.env.N8N_WEBHOOK_URL,
        services: ['Workflow Automation']
      },
      zapier: {
        enabled: !!process.env.ZAPIER_WEBHOOK_URL,
        services: ['Workflow Automation']
      }
    };
  }
}

export const integrationManager = new IntegrationManager();