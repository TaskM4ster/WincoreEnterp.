# Wincore Enterprises

Wincore Enterprises is a web-based gadget repair tracking and management system developed for managing repair records and allowing customers to monitor the progress of their gadgets.

The system provides separate interfaces for staff and customers. Staff can manage repair records, while customers can track their repair status using their tracking number and registered contact number.

## Live Website

**Wincore Enterprises:**  
https://wincoreenterprises.xo.je/

**Customer Tracking:**  
https://wincoreenterprises.xo.je/track

---

## Features

### Staff

- Secure staff login and logout
- Staff account registration
- Single-use invitation codes for new staff accounts
- Administrator-only invitation management
- Dashboard with repair statistics
- Register new gadget repairs
- View repair records
- Search repair records
- Edit repair information
- Update repair status
- Delete repair records
- Automatic tracking number generation
- Session expiration
- CSRF protection
- Login attempt rate limiting

### Customer

- Public repair tracking page
- No customer account required
- Track using:
  - Tracking number
  - Registered contact number
- View gadget information
- View date received
- View current repair status
- Visual repair progress

### Repair Statuses

Repairs may go through the following stages:

1. Pending
2. Under Repair
3. Ready for Pickup
4. Claimed

---

## Technologies Used

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Backend

- PHP
- PDO
- PHP Sessions

### Database

- MySQL

### Development Tools

- Visual Studio Code
- Laragon
- phpMyAdmin
- Git
- GitHub

### Deployment

- InfinityFree

---

## Project Structure

```text
WincoreEntrep/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── api/
│   │   ├── auth/
│   │   ├── staff/
│   │   └── tracking/
│   └── config/
│
└── README.md
