/**
 * inquiry.js - Inquiry Form Handler
 * Since this is a static site with no backend, submitting the form
 * opens a pre-filled email to the site's configured contact address
 * via a mailto: link. No data is stored or sent anywhere else.
 */
const Inquiry = {
    submit(evt) {
        evt.preventDefault();

        const name = document.getElementById('inquiryName').value.trim();
        const email = document.getElementById('inquiryEmail').value.trim();
        const phone = document.getElementById('inquiryPhone').value.trim();
        const subject = document.getElementById('inquirySubject').value.trim();
        const message = document.getElementById('inquiryMessage').value.trim();

        if (!name || !email || !subject || !message) {
            Toast.show('Please fill in all required fields.');
            return;
        }

        const toEmail = (SiteConfig?.contact?.email) || 'info@greenearth.com';

        const bodyLines = [
            `Name: ${name}`,
            `Email: ${email}`,
            phone ? `Phone: ${phone}` : null,
            '',
            message,
        ].filter(Boolean);

        const mailtoUrl =
            `mailto:${encodeURIComponent(toEmail)}` +
            `?subject=${encodeURIComponent('Inquiry: ' + subject)}` +
            `&body=${encodeURIComponent(bodyLines.join('\n'))}`;

        window.location.href = mailtoUrl;

        Toast.show('Opening your email app to send the inquiry...');
        document.getElementById('inquiryForm').reset();
    },
};
