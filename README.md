# BlogBuster Store

Point-of-sale mobile application with customer and admin apps.

## What You Need

- Node.js installed
- Firebase account

## Setup

### 1. Install Dependencies

```bash
cd AdminSite
npm install

cd ../UserSite
npm install
```

### 2. Configure Firebase

Add your Firebase credentials to `FirebaseConfig.ts` in both AdminSite and UserSite folders.

## Start the Apps

### Admin App

```bash
cd AdminSite
npx expo start
```

Login: Admin / admin

### Customer App

```bash
cd UserSite
npx expo start
```

## How It Works

### Customer App

1. Register and login
2. Scan products or browse catalog
3. Add to cart
4. Show QR code at checkout
5. Get instant confirmation when admin scans

### Admin App

1. Login
2. Manage products and stock
3. Scan customer QR codes
4. Orders complete automatically

## Quick Commands

Clear cache:

```bash
npx expo start -c
```

## Troubleshooting

**Firebase not connecting**: Check FirebaseConfig.ts credentials

**QR not scanning**: Grant camera permissions

**Stock not updating**: Check Firebase permissions
