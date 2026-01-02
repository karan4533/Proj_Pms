interface InvitationEmailData {
  inviteeEmail: string;
  workspaceName: string;
  inviterName: string;
  inviteLink: string;
  expiresAt: string;
}

export const createInvitationEmailTemplate = (data: InvitationEmailData): string => {
  const { inviteeEmail, workspaceName, inviterName, inviteLink, expiresAt } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're invited to join ${workspaceName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
            🎉 You're Invited!
        </h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">
            Join your team workspace
        </p>
    </div>
    
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 18px; margin-bottom: 20px;">
            Hi there! 👋
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace in our Project Management System.
        </p>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Workspace:</strong> ${workspaceName}<br>
                <strong>Invited by:</strong> ${inviterName}<br>
                <strong>Your email:</strong> ${inviteeEmail}
            </p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
            Click the button below to accept the invitation and join the workspace:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s;">
                Join ${workspaceName}
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Or copy and paste this link in your browser:
        </p>
        <p style="background: #f1f3f4; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px; color: #333;">
            ${inviteLink}
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #888; margin-bottom: 10px;">
            ⏰ <strong>This invitation expires on:</strong> ${new Date(expiresAt).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
        </p>
        
        <p style="font-size: 14px; color: #888;">
            If you don't want to join this workspace, you can safely ignore this email. The invitation will expire automatically.
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">
                This email was sent from the PMS Project Management System.<br>
                If you believe this email was sent to you by mistake, please ignore it.
            </p>
        </div>
    </div>
</body>
</html>
`;
};

export const createInvitationEmailSubject = (workspaceName: string, inviterName: string): string => {
  return `${inviterName} invited you to join ${workspaceName}`;
};

// CLIENT Invitation Email Template
interface ClientInvitationEmailData {
  clientEmail: string;
  projectName: string;
  inviterName: string;
  inviteLink: string;
  expiresAt: string;
}

export const createClientInvitationEmailTemplate = (data: ClientInvitationEmailData): string => {
  const { clientEmail, projectName, inviterName, inviteLink, expiresAt } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Access Invitation - ${projectName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
            📂 Project Access Granted
        </h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">
            View-only access to project information
        </p>
    </div>
    
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 18px; margin-bottom: 20px;">
            Hello! 👋
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${inviterName}</strong> has granted you read-only access to view the <strong>${projectName}</strong> project in our Project Management System.
        </p>
        
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af; font-weight: 600;">
                🔒 CLIENT ACCESS - Read-Only
            </p>
            <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Project:</strong> ${projectName}<br>
                <strong>Granted by:</strong> ${inviterName}<br>
                <strong>Your email:</strong> ${clientEmail}<br>
                <strong>Access Level:</strong> View tasks, reports, and dashboard only
            </p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
            Click the button below to accept the invitation and access the project:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Access ${projectName}
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Or copy and paste this link in your browser:
        </p>
        <p style="background: #f1f3f4; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px; color: #333;">
            ${inviteLink}
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
                ⏰ <strong>This invitation expires on:</strong><br>
                ${new Date(expiresAt).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
        </div>
        
        <p style="font-size: 14px; color: #888; margin-top: 20px;">
            <strong>What you can do:</strong>
        </p>
        <ul style="font-size: 14px; color: #666; padding-left: 20px;">
            <li>View project dashboard and statistics</li>
            <li>See tasks and their progress</li>
            <li>Access reports and analytics</li>
            <li>Read task comments and updates</li>
        </ul>
        
        <p style="font-size: 14px; color: #888; margin-top: 15px;">
            <strong>What you cannot do:</strong>
        </p>
        <ul style="font-size: 14px; color: #666; padding-left: 20px;">
            <li>Create, edit, or delete tasks</li>
            <li>Modify project settings</li>
            <li>Add or remove team members</li>
        </ul>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #888;">
            If you don't want to access this project, you can safely ignore this email. The invitation will expire automatically.
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">
                This email was sent from the PMS Project Management System.<br>
                If you believe this email was sent to you by mistake, please contact ${inviterName}.
            </p>
        </div>
    </div>
</body>
</html>
`;
};

export const createClientInvitationEmailSubject = (projectName: string): string => {
  return `You've been granted access to ${projectName}`;
};

export type { InvitationEmailData, ClientInvitationEmailData };