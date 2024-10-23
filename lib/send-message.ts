const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN

export async function sendFacebookMessage(senderId: string, text: string) {
    try {
        await fetch(
            `https://graph.facebook.com/v21.0/${FACEBOOK_PAGE_ID}/messages?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient: { id: senderId },
                    message: { text }
                })
            }
        );
    } catch (error) {
        console.error('Error sending message:', error);
    }
}
