const webhookUrl = 'https://open.larksuite.com/open-apis/bot/v2/hook/bb939441-37a3-400a-b8cc-4d71ac0b707d';
const payload = {
    msg_type: "text",
    content: {
        text: "Test message from sandbox"
    }
};

fetch(webhookUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
})
.then(res => res.text())
.then(console.log)
.catch(console.error);
