import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: '请求方法错误' });
    }

    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, error: '请输入激活码' });
    }

    try {
        const dbKey = `code:${code.toUpperCase()}`;
        const status = await kv.get(dbKey);

        if (status === 'unused') {
            await kv.set(dbKey, 'used'); // 核销
            return res.status(200).json({ success: true });
        } else if (status === 'used') {
            return res.status(401).json({ success: false, error: '该激活码已被使用' });
        } else {
            return res.status(401).json({ success: false, error: '无效的激活码' });
        }
    } catch (error) {
        console.error("KV Error:", error);
        return res.status(500).json({ success: false, error: '服务器开小差了，请重试' });
    }
}
