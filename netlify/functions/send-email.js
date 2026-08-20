const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  console.log('📧 Function invoked:', event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const formData = JSON.parse(event.body);
    console.log('📋 Received data:', formData);

    const {
      fullName, email, phone, dob, nationality, county, gender, experience,
      emergencyContact, sponsorshipAmount, teamSize,
      eventName, sport, eventDate, eventLocation, registrationFee,
      paymentMethod
    } = formData;

    // Validate environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('❌ Missing GMAIL environment variables!');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Email configuration missing. Please set GMAIL_USER and GMAIL_PASS.' })
      };
    }

    console.log('📧 GMAIL_USER configured:', process.env.GMAIL_USER);

    if (!fullName || !email || !phone || !eventName) {
      console.error('❌ Missing required fields');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    try {
      await transporter.verify();
      console.log('✅ Transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Transporter verification failed:', verifyError.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Email authentication failed. Check GMAIL_USER and GMAIL_PASS.' })
      };
    }

    // ---------- EMAIL TO APPLICANT ----------
    const applicantMail = {
      from: `"Sports Sponsorship" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `✅ Application Received: ${eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Confirmation</title>
          <style>
            body { margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a1a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a1a; }
            .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px 20px; text-align: center; border-radius: 20px 20px 0 0; border-bottom: 4px solid #FBBF24; position: relative; overflow: hidden; }
            .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=800') center/cover no-repeat; opacity: 0.1; }
            .header h1 { font-size: 28px; color: #FBBF24; margin: 0; letter-spacing: 2px; font-weight: 800; position: relative; }
            .header p { color: #aaa; margin: 5px 0 0; font-size: 14px; position: relative; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
            .content h2 { color: #0a0a1a; font-size: 24px; margin-top: 0; border-bottom: 2px solid #FBBF24; padding-bottom: 10px; }
            .content p { color: #333; line-height: 1.6; }
            .details { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FBBF24; }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
            .details td:first-child { font-weight: 600; color: #0a0a1a; width: 40%; }
            .details tr:last-child td { border-bottom: none; }
            .steps { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .steps ol { padding-left: 20px; color: #333; }
            .steps ol li { margin-bottom: 8px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
            .footer .social { margin-top: 10px; }
            .footer .social a { display: inline-block; margin: 0 8px; text-decoration: none; color: #0a0a1a; font-size: 20px; }
            .btn { display: inline-block; background: #FBBF24; color: #0a0a1a; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: 700; margin-top: 10px; }
            @media only screen and (max-width: 480px) {
              .content { padding: 20px; }
              .details td { display: block; width: 100%; padding: 5px 0; }
              .details td:first-child { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Sports Sponsorship</h1>
              <p>Empowering Athletes Across Kenya</p>
            </div>
            <div class="content">
              <h2>Thank You, ${fullName}!</h2>
              <p>We have received your sponsorship application for <strong>${eventName}</strong>.</p>
              <p>Our team will review your application and get back to you within <strong>48 hours</strong>.</p>

              <div class="details">
                <h3 style="margin-top:0; color:#0a0a1a;">📋 Application Summary</h3>
                <table>
                  <tr><td>Event</td><td>${eventName}</td></tr>
                  <tr><td>Sport</td><td>${sport}</td></tr>
                  <tr><td>Date</td><td>${eventDate}</td></tr>
                  <tr><td>Location</td><td>${eventLocation}</td></tr>
                  <tr><td>Full Name</td><td>${fullName}</td></tr>
                  <tr><td>Phone</td><td>${phone}</td></tr>
                  <tr><td>Nationality</td><td>${nationality}</td></tr>
                  <tr><td>County</td><td>${county}</td></tr>
                  <tr><td>Experience Level</td><td>${experience}</td></tr>
                  <tr><td>Desired Sponsorship</td><td>Ksh ${Number(sponsorshipAmount).toLocaleString()}</td></tr>
                  <tr><td>Team Size</td><td>${teamSize || 'N/A'}</td></tr>
                  <tr><td>Registration Fee</td><td>Ksh ${Number(registrationFee).toLocaleString()}</td></tr>
                  <tr><td>Payment Method</td><td>${paymentMethod}</td></tr>
                </table>
              </div>

              <div class="steps">
                <h3 style="margin-top:0; color:#0a0a1a;">📌 Next Steps</h3>
                <ol>
                  <li>Our team will review your application</li>
                  <li>You'll receive a call from our agent within <strong>1 hour</strong> for payment guidance</li>
                  <li>After payment confirmation, we'll finalize your sponsorship</li>
                </ol>
              </div>

              <p>If you have any questions, simply reply to this email and our support team will get back to you promptly.</p>
              <p style="text-align:center;">
                <a href="#" class="btn">Visit Our Website</a>
              </p>

              <div class="footer">
                <p>© 2026 Sports Sponsorship Platform • All Rights Reserved</p>
                <div class="social">
                  <a href="#">📱</a>
                  <a href="#">🐦</a>
                  <a href="#">📸</a>
                  <a href="#">▶️</a>
                </div>
                <p style="margin-top:10px; font-size:11px;">You received this email because you applied for sponsorship on our platform.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // ---------- EMAIL TO ADMIN ----------
    const adminMail = {
      from: `"Sports Sponsorship" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      replyTo: email,
      subject: `📬 NEW APPLICATION: ${fullName} - ${eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Application</title>
          <style>
            body { margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; }
            .header { background: #0a0a1a; padding: 30px 20px; text-align: center; border-radius: 20px 20px 0 0; border-bottom: 4px solid #FBBF24; }
            .header h1 { font-size: 24px; color: #FBBF24; margin: 0; letter-spacing: 1px; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .content h2 { color: #0a0a1a; font-size: 22px; margin-top: 0; border-bottom: 2px solid #FBBF24; padding-bottom: 10px; }
            .field { padding: 6px 0; border-bottom: 1px solid #eee; font-size: 14px; }
            .field strong { display: inline-block; width: 180px; color: #0a0a1a; }
            .section-title { color: #0a0a1a; font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #FBBF24; padding-left: 10px; }
            .message-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #FBBF24; }
            .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Sponsorship Application</h1>
            </div>
            <div class="content">
              <h2>Applicant Details</h2>
              <div class="field"><strong>Full Name:</strong> ${fullName}</div>
              <div class="field"><strong>Email:</strong> ${email}</div>
              <div class="field"><strong>Phone:</strong> ${phone}</div>
              <div class="field"><strong>Date of Birth:</strong> ${dob}</div>
              <div class="field"><strong>Nationality:</strong> ${nationality}</div>
              <div class="field"><strong>County:</strong> ${county}</div>
              <div class="field"><strong>Gender:</strong> ${gender || 'Not specified'}</div>
              <div class="field"><strong>Experience Level:</strong> ${experience}</div>
              <div class="field"><strong>Emergency Contact:</strong> ${emergencyContact}</div>

              <div class="section-title">Event Details</div>
              <div class="field"><strong>Event:</strong> ${eventName}</div>
              <div class="field"><strong>Sport:</strong> ${sport}</div>
              <div class="field"><strong>Date:</strong> ${eventDate}</div>
              <div class="field"><strong>Location:</strong> ${eventLocation}</div>

              <div class="section-title">Financial Details</div>
              <div class="field"><strong>Desired Sponsorship:</strong> Ksh ${Number(sponsorshipAmount).toLocaleString()}</div>
              <div class="field"><strong>Team Size:</strong> ${teamSize || 'N/A'}</div>
              <div class="field"><strong>Registration Fee:</strong> Ksh ${Number(registrationFee).toLocaleString()}</div>
              <div class="field"><strong>Payment Method:</strong> ${paymentMethod}</div>

              <p style="color:#999; font-size:13px; margin-top:20px;">
                <strong>Received:</strong> ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
              </p>
              <div class="footer">
                <p>© 2026 Sports Sponsorship Platform • Admin Notification</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // ---------- TELEGRAM NOTIFICATION ----------
    const BOT_TOKEN = '8887420345:AAFIrzbCuqIcTatzhIxYN9HTV0iSIaiO7bk';
    const CHAT_ID = '8834429633';

    const telegramMessage = `
🏆 *NEW SPONSORSHIP APPLICATION* 🏆

📌 *Event:* ${eventName}
🏅 *Sport:* ${sport}
📅 *Date:* ${eventDate}
📍 *Location:* ${eventLocation}

👤 *Applicant Details:*
• *Name:* ${fullName}
• *Email:* ${email}
• *Phone:* ${phone}
• *Nationality:* ${nationality}
• *County:* ${county}
• *Experience:* ${experience}

💰 *Desired Sponsorship:* Ksh ${Number(sponsorshipAmount).toLocaleString()}
📞 *Emergency Contact:* ${emergencyContact}
💳 *Payment Method:* ${paymentMethod}

📅 *Submitted:* ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}

---
*Sports Sponsorship Platform*
    `;

    // Send emails
    console.log('📧 Sending applicant email...');
    await transporter.sendMail(applicantMail);
    console.log('✅ Applicant email sent');

    console.log('📧 Sending admin email...');
    await transporter.sendMail(adminMail);
    console.log('✅ Admin email sent');

    // Send Telegram
    console.log('📱 Sending Telegram...');
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    });
    console.log('✅ Telegram sent');

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Emails and Telegram sent successfully!' }),
    };
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message || 'Failed to send notifications.' }),
    };
  }
};
