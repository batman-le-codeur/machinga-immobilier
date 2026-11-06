// Envoi d'emails transactionnels (proprietaires et administrateur) via SMTP.
// Utilise uniquement cote serveur. Sans configuration SMTP, les emails sont
// affiches dans la console du serveur au lieu d'etre envoyes (pratique en
// local, et le site continue de fonctionner).
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { CODE_TTL_MINUTES } from './emailCodes';

let transporter;
let logo;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
    });
  }
  return transporter;
}

// Logo joint a l'email (cid) plutot que charge depuis le site : il s'affiche
// meme si le site est inaccessible, et Gmail n'affiche pas les SVG.
const LOGO_CID = 'logo@machinga-immobilier';
function getLogoAttachment() {
  if (logo === undefined) {
    try {
      logo = fs.readFileSync(path.join(process.cwd(), 'public', 'logo-email.png'));
    } catch {
      logo = null;
    }
  }
  return logo ? [{ filename: 'machinga-immobilier.png', content: logo, cid: LOGO_CID }] : [];
}

export async function sendMail({ to, subject, text, html }) {
  // Hostinger refuse un expediteur different de la boite authentifiee (ou
  // d'un de ses alias) : par defaut on envoie donc au nom de SMTP_USER.
  const from =
    process.env.SMTP_FROM ||
    `MACHINGA IMMOBILIER <${process.env.SMTP_USER || 'contact@machinga-immobilier.com'}>`;
  const t = getTransporter();

  if (!t) {
    console.info(`[email non envoye : SMTP non configure]\nA : ${to}\nObjet : ${subject}\n\n${text}\n`);
    return;
  }

  try {
    await t.sendMail({ from, to, subject, text, html, attachments: html ? getLogoAttachment() : [] });
  } catch (err) {
    // Un email qui echoue ne doit jamais faire echouer l'action de l'utilisateur.
    console.error("Erreur d'envoi d'email :", err.message);
  }
}

// ---------------------------------------------------------------------------
// Gabarit HTML commun. Mise en page en tableaux et styles en ligne : c'est ce
// que les messageries (Gmail, Outlook, Apple Mail) affichent correctement.
// ---------------------------------------------------------------------------

const COLORS = {
  primary: '#1F3A5F',
  secondary: '#4F6F52',
  ink: '#1C2430',
  muted: '#5F6B7A',
  rule: '#E3E7EC',
  soft: '#F6F8FA',
  page: '#EEF1F5'
};
const FONT = "Arial, Helvetica, sans-serif";

function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || '';
  return url.startsWith('https://') ? url.replace(/\/$/, '') : 'https://machinga-immobilier.com';
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function paragraph(html) {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:24px;color:${COLORS.ink};">${html}</p>`;
}

function note(html) {
  return `<p style="margin:0 0 12px;font-family:${FONT};font-size:13px;line-height:20px;color:${COLORS.muted};">${html}</p>`;
}

function codeBlock(code) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
    <tr>
      <td align="center" style="background:${COLORS.soft};border:1px solid ${COLORS.rule};border-radius:8px;padding:22px 12px;">
        <div style="font-family:${FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.muted};margin-bottom:8px;">Votre code</div>
        <div style="font-family:'Courier New', Courier, monospace;font-size:36px;line-height:40px;font-weight:bold;letter-spacing:10px;color:${COLORS.primary};padding-left:10px;">${escapeHtml(code)}</div>
      </td>
    </tr>
  </table>`;
}

function button(label, href) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
    <tr>
      <td align="center" bgcolor="${COLORS.secondary}" style="border-radius:6px;">
        <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function quote(label, html) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;">
    <tr>
      <td style="border-left:3px solid ${COLORS.secondary};background:${COLORS.soft};padding:14px 18px;">
        <div style="font-family:${FONT};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${COLORS.secondary};margin-bottom:4px;">${label}</div>
        <div style="font-family:${FONT};font-size:15px;line-height:22px;color:${COLORS.ink};">${html}</div>
      </td>
    </tr>
  </table>`;
}

function layout({ preheader, title, content }) {
  const site = siteUrl();
  const logoHtml = getLogoAttachment().length
    ? `<img src="cid:${LOGO_CID}" width="190" height="58" alt="MACHINGA IMMOBILIER" style="display:block;border:0;width:190px;height:auto;">`
    : `<span style="font-family:${FONT};font-size:22px;font-weight:bold;letter-spacing:2px;color:${COLORS.primary};">MACHINGA IMMOBILIER</span>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.page};">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr><td style="height:4px;background:${COLORS.secondary};font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td align="center" style="padding:28px 32px 24px;border-bottom:1px solid ${COLORS.rule};">
            <a href="${site}" target="_blank" style="text-decoration:none;">${logoHtml}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 16px;">
            <h1 style="margin:0 0 20px;font-family:${FONT};font-size:22px;line-height:30px;font-weight:bold;color:${COLORS.primary};">${escapeHtml(title).replace(/e-mail/g, '<span style="white-space:nowrap;">e-mail</span>')}</h1>
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0;font-family:${FONT};font-size:15px;line-height:24px;color:${COLORS.ink};">Cordialement,<br><strong>L’équipe MACHINGA IMMOBILIER</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background:${COLORS.primary};padding:22px 40px;">
            <p style="margin:0 0 6px;font-family:${FONT};font-size:13px;line-height:20px;color:#ffffff;font-weight:bold;">S.C.I MACHINGA IMMOBILIER</p>
            <p style="margin:0;font-family:${FONT};font-size:12px;line-height:19px;color:#C9D3E0;">L’immobilier digital à Libreville, Gabon<br><a href="${site}" target="_blank" style="color:#ffffff;text-decoration:underline;">${site.replace('https://', '')}</a></p>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-family:${FONT};font-size:11px;line-height:17px;color:${COLORS.muted};max-width:600px;">Cet email vous a été envoyé automatiquement par le site MACHINGA IMMOBILIER.</p>
    </td>
  </tr>
</table>
</body>
</html>`;
}

const SIGNATURE = '\n\nCordialement,\nL’équipe MACHINGA IMMOBILIER\nLibreville, Gabon';

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

export function verificationCodeEmail({ nom, code }) {
  return {
    subject: `${code} est votre code de vérification MACHINGA IMMOBILIER`,
    text:
      `Bonjour ${nom || ''},\n\n` +
      'Bienvenue sur MACHINGA IMMOBILIER. Pour activer votre compte propriétaire, saisissez ce code sur le site :\n\n' +
      `${code}\n\n` +
      `Ce code est valable ${CODE_TTL_MINUTES} minutes. Si vous n’avez pas créé de compte, ignorez cet email.` +
      SIGNATURE,
    html: layout({
      preheader: `Votre code de vérification : ${code}`,
      title: 'Confirmez votre adresse e-mail',
      content:
        paragraph(`Bonjour ${escapeHtml(nom)},`) +
        paragraph(
          'Bienvenue sur MACHINGA IMMOBILIER. Pour activer votre compte propriétaire et publier vos biens en location, saisissez le code ci-dessous sur le site :'
        ) +
        codeBlock(code) +
        note(`Ce code est valable <strong>${CODE_TTL_MINUTES} minutes</strong> et ne peut être utilisé qu’une seule fois.`) +
        note('Si vous n’êtes pas à l’origine de cette inscription, ignorez simplement cet email.')
    })
  };
}

export function resetCodeEmail({ nom, code }) {
  return {
    subject: `${code} est votre code de réinitialisation MACHINGA IMMOBILIER`,
    text:
      `Bonjour ${nom || ''},\n\n` +
      'Vous avez demandé à réinitialiser le mot de passe de votre compte propriétaire. Saisissez ce code sur le site :\n\n' +
      `${code}\n\n` +
      `Ce code est valable ${CODE_TTL_MINUTES} minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email : votre mot de passe reste inchangé.` +
      SIGNATURE,
    html: layout({
      preheader: `Votre code de réinitialisation : ${code}`,
      title: 'Réinitialisation de votre mot de passe',
      content:
        paragraph(`Bonjour ${escapeHtml(nom)},`) +
        paragraph(
          'Vous avez demandé à réinitialiser le mot de passe de votre compte propriétaire. Saisissez le code ci-dessous sur le site pour choisir un nouveau mot de passe :'
        ) +
        codeBlock(code) +
        note(`Ce code est valable <strong>${CODE_TTL_MINUTES} minutes</strong> et ne peut être utilisé qu’une seule fois.`) +
        note(
          'Si vous n’êtes pas à l’origine de cette demande, ignorez cet email : votre mot de passe reste inchangé.'
        )
    })
  };
}

export function listingPublishedEmail({ nom, titre, link }) {
  return {
    subject: `Votre annonce est en ligne : ${titre}`,
    text:
      `Bonjour ${nom || ''},\n\n` +
      `Bonne nouvelle : votre annonce « ${titre} » a été validée et est maintenant visible sur le site.\n\n` +
      `Voir l’annonce : ${link}` +
      SIGNATURE,
    html: layout({
      preheader: `Votre annonce « ${titre} » est visible sur le site.`,
      title: 'Votre annonce est en ligne',
      content:
        paragraph(`Bonjour ${escapeHtml(nom)},`) +
        paragraph('Bonne nouvelle : votre annonce a été vérifiée par notre équipe et elle est maintenant visible par tous les visiteurs du site.') +
        quote('Annonce', escapeHtml(titre)) +
        button('Voir mon annonce', link) +
        note('Les visiteurs intéressés vous contacteront directement au numéro de téléphone indiqué sur votre compte.')
    })
  };
}

export function listingRejectedEmail({ nom, titre, motif, link }) {
  return {
    subject: `Votre annonce n’a pas été validée : ${titre}`,
    text:
      `Bonjour ${nom || ''},\n\n` +
      `Votre annonce « ${titre} » n’a pas été validée.\n\n` +
      `Motif : ${motif}\n\n` +
      `Vous pouvez la corriger depuis votre espace propriétaire, elle sera alors de nouveau examinée :\n${link}` +
      SIGNATURE,
    html: layout({
      preheader: `Votre annonce « ${titre} » doit être corrigée.`,
      title: 'Votre annonce n’a pas été validée',
      content:
        paragraph(`Bonjour ${escapeHtml(nom)},`) +
        paragraph(`Après vérification, votre annonce <strong>« ${escapeHtml(titre)} »</strong> n’a pas pu être publiée pour la raison suivante :`) +
        quote('Motif', escapeHtml(motif).replace(/\n/g, '<br>')) +
        paragraph('Vous pouvez la corriger depuis votre espace propriétaire. Elle sera alors de nouveau examinée par notre équipe.') +
        button('Corriger mon annonce', link)
    })
  };
}

export function listingPendingAdminEmail({ titre, ownerNom, ownerTelephone, link }) {
  return {
    subject: `Nouvelle annonce à valider : ${titre}`,
    text:
      `Une annonce de propriétaire attend votre validation.\n\n` +
      `Annonce : ${titre}\nPropriétaire : ${ownerNom} (${ownerTelephone})\n\n` +
      `File de validation : ${link}`,
    html: layout({
      preheader: `${ownerNom} a déposé « ${titre} ».`,
      title: 'Nouvelle annonce à valider',
      content:
        paragraph('Une annonce déposée par un propriétaire attend votre validation.') +
        quote(
          'Annonce',
          `<strong>${escapeHtml(titre)}</strong><br><span style="color:${COLORS.muted};font-size:14px;">${escapeHtml(ownerNom)} · ${escapeHtml(ownerTelephone)}</span>`
        ) +
        button('Ouvrir la file de validation', link)
    })
  };
}
