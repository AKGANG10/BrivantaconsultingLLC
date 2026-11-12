# Brivanta Consulting LLC website

This is a lightweight, static website. It has no build step or third-party runtime dependencies.

## Local preview

From this folder, run:

```powershell
node tools/preview-server.mjs
```

Then open `http://localhost:4173`.

## Optional EmailJS delivery

The contact form validates its fields and sends through EmailJS using the `Contact Us` template. Its template fields are `user_name`, `name`, `email`, `time`, and `message`; the configured template routes inquiries to `hr@brivantaconsultingllc.com` and uses the visitor email for replies. The form keeps an email-link fallback if EmailJS configuration is removed. Do not put an EmailJS Private Key in browser code.

## Image credit

The local photographs are by Vitaly Gariev (<https://unsplash.com/photos/four-business-people-in-a-meeting-discussing-documents-YHC8oV7tcdM>), Aalo Lens (<https://unsplash.com/photos/modern-office-lounge-area-with-contemporary-furniture-QVVHV24DA_o>), and Rodrigo Rodrigues (<https://unsplash.com/photos/a-woman-smiles-while-working-on-her-laptop-GwLG4qG3y0U>) on Unsplash. They are available under the Unsplash License.
