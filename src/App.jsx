import React, { useEffect, useMemo, useState } from "react";

const uid = () => Math.random().toString(36).slice(2, 9);

const STORAGE_KEYS = {
  contacts: "cf_contacts_v1",
  tags: "cf_tags_v1",
};

const DEFAULT_TAGS = [
  { id: "family", name: "خانواده" },
  { id: "friends", name: "دوستان" },
  { id: "coworkers", name: "همکاران" },
];

// Utils: localStorage JSON helpers
const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// Simple email regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Modal component
function Modal({ title, children, open, onClose }) {
  if (!open) return null;
  return (
    <div className="modalBack" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <strong>{title}</strong>
          <button className="ghost" onClick={onClose}>
            بستن
          </button>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   GIT FLOW COMMENT:
   feat(tags): create TagManager with add/edit/remove tags
--------------------------------------------------------------*/
function TagManager({ tags, setTags }) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");

  const addTag = () => {
    const n = name.trim();
    if (!n) return;
    const id = uid();
    setTags([...tags, { id, name: n }]);
    setName("");
  };

  const startEdit = (t) => {
    setEditing(t.id);
    setEditName(t.name);
  };
  const applyEdit = () => {
    setTags(
      tags.map((t) =>
        t.id === editing ? { ...t, name: editName.trim() || t.name } : t
      )
    );
    setEditing(null);
    setEditName("");
  };
  const removeTag = (id) => setTags(tags.filter((t) => t.id !== id));

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="row">
        <div className="col-12">
          <strong>مدیریت دسته‌ها (تگ‌ها)</strong>
          <p className="helper">
            دسته‌ی جدید اضافه کنید، نام را ویرایش کنید، یا حذف نمایید.
          </p>
        </div>
        <div className="col-8">
          <input
            className="input"
            id="tag-input"
            placeholder="نام دسته جدید..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="col-4">
          <button className="add-tag-btn" onClick={addTag}>
            افزودن دسته
          </button>
        </div>
        <div className="col-12 chips">
          {tags.map((t) => (
            <div className="chip" key={t.id}>
              {editing === t.id ? (
                <>
                  <input
                    className="input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <button className="secondary" onClick={applyEdit}>
                    اعمال
                  </button>
                </>
              ) : (
                <>
                  <span className="tag-cat">{t.name}</span>
                  <span className="x" id="Edit" onClick={() => startEdit(t)}>
                    ویرایش
                  </span>
                  <span
                    className="x"
                    id="Remove"
                    onClick={() => removeTag(t.id)}
                  >
                    حذف
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   GIT FLOW COMMENT:
   feat(contacts): add ContactForm with validation and multi-tags
--------------------------------------------------------------*/
function ContactForm({ onSubmit, onCancel, initial, tags }) {
  const [form, setForm] = useState({
    firstName: initial?.firstName || "",
    lastName: initial?.lastName || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    tags: initial?.tags || [],
  });
  const [errors, setErrors] = useState({});

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleTag = (id) => {
    setForm((p) => ({
      ...p,
      tags: p.tags.includes(id)
        ? p.tags.filter((x) => x !== id)
        : [...p.tags, id],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "نام الزامی است";
    if (!form.lastName.trim()) e.lastName = "نام خانوادگی الزامی است";
    if (!form.email.trim()) e.email = "ایمیل الزامی است";
    else if (!emailRegex.test(form.email)) e.email = "فرمت ایمیل صحیح نیست";
    if (form.phone && form.phone.trim().length < 8)
      e.phone = "شماره حداقل ۸ رقم";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form });
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginTop: 12 }}>
      <div className="row">
        <div className="col-6">
          <label>نام</label>
          <input
            className="input"
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
          />
          {errors.firstName && <div className="error">{errors.firstName}</div>}
        </div>
        <div className="col-6">
          <label>نام خانوادگی</label>
          <input
            className="input"
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
          />
          {errors.lastName && <div className="error">{errors.lastName}</div>}
        </div>
        <div className="col-6">
          <label>ایمیل</label>
          <input
            className="input"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>
        <div className="col-6">
          <label>تلفن</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
          {errors.phone && <div className="error">{errors.phone}</div>}
        </div>

        <div className="col-12">
          <label>دسته‌ها</label>
          <div className="chips">
            {tags.map((t) => (
              <div className="chip" key={t.id}>
                <input
                  type="checkbox"
                  checked={form.tags.includes(t.id)}
                  onChange={() => toggleTag(t.id)}
                />
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="col-12"
          style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}
        >
          <button type="submit">
            {initial ? "ذخیره تغییرات" : "افزودن مخاطب"}
          </button>
          <button type="button" className="secondary" onClick={onCancel}>
            انصراف
          </button>
        </div>
      </div>
    </form>
  );
}

/* -----------------------------------------------------------
   GIT FLOW COMMENT:
   feat(list): table-style responsive list + bulk selection
--------------------------------------------------------------*/
function ListHeader({ allChecked, onToggleAll }) {
  return (
    <div className="head">
      <div>
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(e) => onToggleAll(e.target.checked)}
        />
      </div>
      <div>نام</div>
      <div>نام خانوادگی</div>
      <div>ایمیل</div>
      <div>تلفن</div>
      <div>اقدامات</div>
    </div>
  );
}

function Row({ c, checked, onToggle, onEdit, onDelete, tagLookup }) {
  return (
    <div className="rowItem">
      <div data-th="انتخاب">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
        />
      </div>
      <div data-th="نام">{c.firstName}</div>
      <div data-th="نام خانوادگی">{c.lastName}</div>
      <div data-th="ایمیل">{c.email}</div>
      <div data-th="تلفن">{c.phone || "-"}</div>
      <div className="actionsCell">
        <button className="secondary" onClick={onEdit}>
          ویرایش
        </button>
        <button className="danger" onClick={onDelete}>
          حذف
        </button>
      </div>
      <div className="col-12" style={{ gridColumn: "1 / -1" }}>
        <div className="chips">
          {c.tags.map((tid) => (
            <div key={tid} className="chip">
              {tagLookup[tid] || tid}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   GIT FLOW COMMENT:
   feat(search): add search by email, first & last name
--------------------------------------------------------------*/
function SearchBar({ query, setQuery, tagFilter, setTagFilter, tags }) {
  return (
    <div className="searchWrap">
      <input
        className="input"
        placeholder="جستجو: نام، نام‌خانوادگی یا ایمیل..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="filterTags">
        {tags.map((t) => (
          <label className="chip" key={t.id}>
            <input
              type="checkbox"
              checked={tagFilter.includes(t.id)}
              onChange={(e) => {
                if (e.target.checked) setTagFilter([...tagFilter, t.id]);
                else setTagFilter(tagFilter.filter((x) => x !== t.id));
              }}
            />
            <span>{t.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   GIT FLOW COMMENT:
   feat(bulk): bulk delete with confirmation modal
--------------------------------------------------------------*/
export default function App() {
  const [contacts, setContacts] = useState(() =>
    load(STORAGE_KEYS.contacts, [])
  );
  const [tags, setTags] = useState(() => load(STORAGE_KEYS.tags, DEFAULT_TAGS));
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState([]);
  const [selected, setSelected] = useState({}); // id -> bool
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    onYes: () => {},
  });

  // Persist to localStorage
  useEffect(() => save(STORAGE_KEYS.contacts, contacts), [contacts]);
  useEffect(() => save(STORAGE_KEYS.tags, tags), [tags]);

  // Selection helpers
  const ids = contacts.map((c) => c.id);
  const allChecked = ids.length > 0 && ids.every((id) => !!selected[id]);
  const toggleAll = (checked) => {
    const next = {};
    if (checked) ids.forEach((id) => (next[id] = true));
    setSelected(checked ? next : {});
  };

  const tagLookup = useMemo(
    () => Object.fromEntries(tags.map((t) => [t.id, t.name])),
    [tags]
  );

  // Filtered list by query & tags
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      const inQuery =
        !q ||
        [c.firstName, c.lastName, c.email].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(q)
        );
      const inTags =
        tagFilter.length === 0 || tagFilter.every((t) => c.tags.includes(t));
      return inQuery && inTags;
    });
  }, [contacts, query, tagFilter]);

  // CRUD operations with confirmation modals
  const ask = (title, onYes) => setConfirm({ open: true, title, onYes });
  const closeConfirm = () =>
    setConfirm({ open: false, title: "", onYes: () => {} });

  const addContact = (payload) => {
    const newC = { id: uid(), ...payload };
    setContacts([newC, ...contacts]);
    setShowForm(false);
  };
  const updateContact = (id, payload) => {
    setContacts(contacts.map((c) => (c.id === id ? { ...c, ...payload } : c)));
    setEditTarget(null);
    setShowForm(false);
  };
  const deleteContact = (id) =>
    setContacts(contacts.filter((c) => c.id !== id));

  const bulkDelete = () => {
    const delIds = Object.keys(selected).filter((k) => selected[k]);
    setContacts(contacts.filter((c) => !delIds.includes(c.id)));
    setSelected({});
  };

  return (
    <div className="container">
      <div className="card header">
        <div className="brand">
          <img
            className="brand-img"
            src="/favicon.svg"
            width="24"
            height="24"
            alt="app"
          />
          <span>مدیریت مخاطبین</span>
        </div>
        <div className="actions">
          <button
            onClick={() => {
              setEditTarget(null);
              setShowForm(true);
            }}
          >
            افزودن مخاطب
          </button>
          <button
            className="secondary"
            onClick={() =>
              ask("آیا از حذف گروهی مخاطبین انتخاب‌شده مطمئن هستید؟", () => {
                bulkDelete();
                closeConfirm();
              })
            }
            disabled={Object.values(selected).every((v) => !v)}
          >
            حذف گروهی
          </button>
        </div>
      </div>

      <SearchBar
        query={query}
        setQuery={setQuery}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        tags={tags}
      />

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty">مخاطبی یافت نشد</div>
        ) : (
          <div className="list">
            <ListHeader allChecked={allChecked} onToggleAll={toggleAll} />
            {filtered.map((c) => (
              <Row
                key={c.id}
                c={c}
                tagLookup={tagLookup}
                checked={!!selected[c.id]}
                onToggle={(chk) => setSelected((s) => ({ ...s, [c.id]: chk }))}
                onEdit={() => {
                  setEditTarget(c);
                  setShowForm(true);
                }}
                onDelete={() =>
                  ask(
                    `آیا از حذف «${c.firstName} ${c.lastName}» مطمئنید؟`,
                    () => {
                      deleteContact(c.id);
                      closeConfirm();
                    }
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      <TagManager tags={tags} setTags={setTags} />

      {showForm && (
        <Modal
          title={editTarget ? "ویرایش مخاطب" : "افزودن مخاطب"}
          open={true}
          onClose={() => setShowForm(false)}
        >
          <ContactForm
            initial={editTarget}
            tags={tags}
            onCancel={() => setShowForm(false)}
            onSubmit={(payload) => {
              if (editTarget) updateContact(editTarget.id, payload);
              else addContact(payload);
            }}
          />
        </Modal>
      )}

      <Modal title="تایید عملیات" open={confirm.open} onClose={closeConfirm}>
        <p style={{ margin: "10px 0" }}>{confirm.title}</p>
        <footer>
          <button onClick={() => confirm.onYes?.()}>تایید</button>
          <button className="secondary" onClick={closeConfirm}>
            لغو
          </button>
        </footer>
      </Modal>
    </div>
  );
}
