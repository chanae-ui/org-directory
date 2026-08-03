import { getInitials, getAvatarColor } from './utils.js';
import { IconBriefcase, IconBuilding, IconTag, IconMapPin, IconPhone, IconMail, IconChevronRight } from './icons.jsx';

export default function ContactDetail({ contact, onClose }) {
  const fullName = `${contact.first_name} ${contact.last_name}`.trim();
  const avatar = getAvatarColor(fullName);

  const fields = [
    { Icon: IconBriefcase, label: 'תפקיד', value: contact.role },
    { Icon: IconBuilding, label: 'בית ספר / מוסד', value: contact.school_name },
    { Icon: IconTag, label: 'סמל מוסד', value: contact.institution_code },
    { Icon: IconMapPin, label: 'עיר', value: contact.city },
    { Icon: IconPhone, label: 'טלפון', value: contact.phone },
    { Icon: IconMail, label: 'מייל', value: contact.email },
  ].filter((f) => f.value);

  return (
    <div className="detail-sheet">
      <div className="detail-header">
        <button className="back-button" onClick={onClose}>
          <IconChevronRight /> חזרה
        </button>
      </div>

      <div className="detail-hero">
        <span className="avatar avatar-large" style={{ background: avatar.bg, color: avatar.fg }}>
          {getInitials(contact.first_name, contact.last_name)}
        </span>
        <h2>{fullName}</h2>
        {contact.role && <p className="detail-role">{contact.role}</p>}
      </div>

      <div className="quick-actions">
        <a
          className={`quick-action ${!contact.phone ? 'disabled' : ''}`}
          href={contact.phone ? `tel:${contact.phone}` : undefined}
        >
          <span className="quick-action-circle call"><IconPhone /></span>
          <span>התקשרות</span>
        </a>
        <a
          className={`quick-action ${!contact.email ? 'disabled' : ''}`}
          href={contact.email ? `mailto:${contact.email}` : undefined}
        >
          <span className="quick-action-circle mail"><IconMail /></span>
          <span>מייל</span>
        </a>
      </div>

      <div className="info-list">
        {fields.map((f) => (
          <div className="info-row" key={f.label}>
            <f.Icon className="info-icon" />
            <span className="info-label">{f.label}</span>
            <span className="info-value">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
