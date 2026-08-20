const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  console.log('📧 Approval function invoked');

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const formData = JSON.parse(event.body);
    const { to_email, to_name, event_name, sport, registration_fee, submission_date } = formData;

    console.log('📧 Sending approval email to:', to_email);

    if (!to_email || !to_name) {
      console.error('❌ Missing required fields');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Check environment variables
    console.log('📧 GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'NOT SET');
    console.log('📧 GMAIL_PASS:', process.env.GMAIL_PASS ? 'Set' : 'NOT SET');

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('❌ Missing GMAIL environment variables!');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Email configuration missing. Please set GMAIL_USER and GMAIL_PASS in Netlify environment variables.' 
        })
      };
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
        body: JSON.stringify({ 
          error: 'Email authentication failed. Check that GMAIL_USER and GMAIL_PASS are correct. Error: ' + verifyError.message 
        })
      };
    }

    const mailOptions = {
      from: `"Sports Sponsorship" <${process.env.GMAIL_USER}>`,
      to: to_email,
      subject: `✅ Registration Payment Confirmed – ${event_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
          <style>
            body { margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a1a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a1a; }
            .header {
              background: linear-gradient(135deg, #1a1a2e, #16213e);
              padding: 40px 20px 30px;
              text-align: center;
              border-radius: 20px 20px 0 0;
              border-bottom: 4px solid #FBBF24;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              inset: 0;
              background: url('https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=800') center/cover no-repeat;
              opacity: 0.1;
            }
            .header h1 { font-size: 28px; color: #FBBF24; margin: 0; letter-spacing: 2px; font-weight: 800; position: relative; }
            .header p { color: #aaa; margin: 5px 0 0; font-size: 14px; position: relative; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
            .content h2 { color: #0a0a1a; font-size: 24px; margin-top: 0; border-bottom: 2px solid #FBBF24; padding-bottom: 10px; }
            .content p { color: #333; line-height: 1.6; }
            .badge {
              background: linear-gradient(135deg, #2ed573, #26de81);
              color: #fff;
              padding: 8px 24px;
              border-radius: 50px;
              display: inline-block;
              font-weight: 700;
              font-size: 0.9rem;
            }
            .details {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #2ed573;
            }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
            .details td:first-child { font-weight: 600; color: #0a0a1a; width: 40%; }
            .details tr:last-child td { border-bottom: none; }
            .timeline {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
            }
            .timeline .step { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eee; }
            .timeline .step:last-child { border-bottom: none; }
            .timeline .step .num {
              background: #FBBF24;
              color: #0a0a1a;
              border-radius: 50%;
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 0.8rem;
              flex-shrink: 0;
            }
            .timeline .step .text { color: #333; font-size: 0.9rem; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
            .btn { display: inline-block; background: #FBBF24; color: #0a0a1a; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: 700; margin-top: 10px; }
            .highlight { color: #FBBF24; font-weight: 700; }
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
              <h2>Dear ${to_name},</h2>
              <p style="text-align:center;"><span class="badge">✅ Payment Confirmed</span></p>
              <p>We are pleased to inform you that your <strong>registration fee payment of Ksh ${Number(registration_fee).toLocaleString()}</strong> for <strong>${event_name}</strong> has been successfully received.</p>

              <div class="details">
                <h3 style="margin-top:0; color:#0a0a1a;">📋 Payment Summary</h3>
                <table>
                  <tr><td>Event</td><td>${event_name}</td></tr>
                  <tr><td>Sport</td><td>${sport}</td></tr>
                  <tr><td>Amount Paid</td><td>Ksh ${Number(registration_fee).toLocaleString()}</td></tr>
                  <tr><td>Status</td><td><span style="color:#2ed573; font-weight:700;">✅ Confirmed</span></td></tr>
                  <tr><td>Submitted On</td><td>${submission_date}</td></tr>
                </table>
              </div>

              <div class="timeline">
                <h3 style="margin-top:0; color:#0a0a1a;">📌 Next Steps</h3>
                <div class="step"><span class="num">1</span><span class="text"><strong>Payment Received</strong> – Your registration fee has been confirmed.</span></div>
                <div class="step"><span class="num">2</span><span class="text"><strong>Application Under Review</strong> – Our sponsorship committee is currently evaluating your application.</span></div>
                <div class="step"><span class="num">3</span><span class="text"><strong>Sponsorship Decision</strong> – You will receive the final sponsorship approval letter within <span class="highlight">72 hours</span> via email.</span></div>
              </div>

              <p>Thank you for choosing Sports Sponsorship Platform. We are excited to support your athletic journey!</p>
              <p style="text-align:center;">
                <a href="#" class="btn">Track Your Application</a>
              </p>

              <div class="footer">
                <p>© 2026 Sports Sponsorship Platform • All Rights Reserved</p>
                <p style="margin-top:10px; font-size:11px;">This is an automated confirmation. If you have any questions, reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log('📧 Sending approval email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent successfully. Message ID:', result.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Approval email sent successfully!' }),
    };
  } catch (error) {
    console.error('❌ Approval email error:', error.message);
    console.error('❌ Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send approval email.' 
      }),
    };
  }
};
