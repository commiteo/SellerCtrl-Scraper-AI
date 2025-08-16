# 🔒 أمان الخادم - خطوات مهمة

## تحذير أمني مهم
تم مشاركة بيانات SSH في محادثة عامة. يُنصح بتغيير كلمة المرور فوراً بعد النشر.

## خطوات الأمان الأساسية:

### 1. تغيير كلمة مرور root
```bash
passwd root
```

### 2. إنشاء مستخدم جديد
```bash
adduser deploy
usermod -aG sudo deploy
```

### 3. إعداد SSH Key (موصى به)
```bash
ssh-keygen -t rsa -b 4096
# ثم نسخ المفتاح العام للخادم
```

### 4. تعطيل root login (بعد إعداد المستخدم الجديد)
```bash
nano /etc/ssh/sshd_config
# PermitRootLogin no
systemctl restart sshd
```

### 5. إعداد Firewall
```bash
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```
