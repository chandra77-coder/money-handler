import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFinance } from "../context/FinanceContext";
import { THEMES, THEME_CONFIG } from "../constants/theme";
import { fmt, todayStr, compressImage } from "../utils/formatters";
import { monthYearStr, genWorkCode, applySpendAmountChange, toAmount } from "../utils/dataHelpers";
import { Sheet, TypeToggle, Label, FInput, ChipRow, FBtn, SearchBar } from "./Shared";

const makeEmptyWork = () => ({ type: "work", name: "", customer: "", code: "", status: "unpaid", amount: "", method: "Cash", date: todayStr(), photo: null });

export function Work() {
  const { 
    workRecords, setWorkRecords, addWorkRecord, updateWorkRecord, deleteWorkRecord,
    workNames, theme, workBalance
  } = useFinance();

  const [search, setSearch] = useState("");
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(makeEmptyWork);
  const [delId, setDelId] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const currentTheme = THEMES[theme] || THEMES.light;
  const T = currentTheme.colors;
  const G = currentTheme.gradient;
  const R = THEME_CONFIG.radius;
  const SH = THEME_CONFIG.shadow;

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.trim().toLowerCase() === "create") {
      setTimeout(() => {
        const existingCodes = new Set(workRecords.filter(w => w.code).map(w => w.code));
        const newCode = genWorkCode(existingCodes);
        setSearch("");
        setForm({ ...makeEmptyWork(), code: newCode });
        setEditId(null);
        setShowSheet(true);
      }, 200);
    }
  };

  const openAdd = () => {
    const existingCodes = new Set(workRecords.filter(w => w.code).map(w => w.code));
    const newCode = genWorkCode(existingCodes);
    setForm({ ...makeEmptyWork(), code: newCode });
    setEditId(null);
    setShowSheet(true);
  };
  const openEdit = (w) => { setForm({ ...w, amount: String(w.amount || "") }); setEditId(w.id); setShowSheet(true); };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file, (compressed) => {
      setForm(f => ({ ...f, photo: compressed }));
    });
  };

  const save = () => {
    if (form.type === "work") {
      if (!form.name) { alert("Work Name is required."); return; }
      if (!form.amount || parseFloat(form.amount) <= 0) { alert("Work Amount is required."); return; }
      if (form.status === "paid" && !form.method) { alert("Payment Method is required for Paid status."); return; }
    } else {
      if (!form.amount || parseFloat(form.amount) <= 0) { alert("Spend Amount is required."); return; }
    }
    const parsedAmount = parseFloat(form.amount) || 0;
    const entry = { ...form, amount: parsedAmount, code: form.code || "" };
    if (editId) updateWorkRecord(editId, entry);
    else addWorkRecord(entry);
    setShowSheet(false); setEditId(null);
  };

  const today = todayStr();
  const todayEarning = workRecords.filter(w => w.type === "work" && w.status === "paid" && w.date === today).reduce((s, w) => s + toAmount(w.amount), 0);
  const totalWork = workRecords.filter(w => w.type === "work").length;
  const paidCount = workRecords.filter(w => w.type === "work" && w.status === "paid").length;
  const unpaidCount = workRecords.filter(w => w.type === "work" && w.status === "unpaid").length;
  const unpaidAmount = workRecords.filter(w => w.type === "work" && w.status === "unpaid").reduce((s, w) => s + toAmount(w.amount), 0);

  const visible = workRecords.filter(w => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (w.name || "").toLowerCase().includes(q) || (w.customer || "").toLowerCase().includes(q);
  });

  const analysis = workNames.map(name => ({
    name,
    count: workRecords.filter(w => w.type === "work" && w.name === name).length
  })).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div>
      <div style={{ background: G.header, padding: "22px 16px 18px", color: "white", borderRadius: `0 0 ${R.xl}px ${R.xl}px`, boxShadow: SH.card }}>
        <div style={{ fontSize: 11, opacity: .6, letterSpacing: 1.5, fontWeight: 600 }}>{monthYearStr()}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, fontFamily: THEME_CONFIG.font.money }}>Work Tracker</div>

        <div style={{ background: T.glassStrong, borderRadius: R.lg, padding: "15px 18px", border: `1px solid ${T.glassBorder}`, marginBottom: 14, backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, opacity: .65, fontWeight: 600 }}>TODAY'S EARNING</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.gold, fontFamily: THEME_CONFIG.font.money }}>{fmt(todayEarning)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, opacity: .65, fontWeight: 600 }}>TOTAL JOBS</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: THEME_CONFIG.font.money }}>{totalWork}</div>
            </div>
          </div>
          <div style={{ height: 1, background: T.glassBorder, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>🟢 PAID</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.mint }}>{paidCount} work</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>🔴 UNPAID</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FCA5A5" }}>{fmt(unpaidAmount)} <span style={{fontSize:11, opacity:.8, fontWeight:500}}>({unpaidCount} work)</span></div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>💰 WORK BALANCE</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.gold }}>{fmt(workBalance)}</div>
            </div>
          </div>
        </div>
        <SearchBar value={search} onChange={handleSearch} placeholder='Search jobs or type "create"…' />
      </div>

      <div style={{ padding: "10px 12px" }}>
        <div style={{ background: T.card, borderRadius: R.lg, padding: "14px", marginBottom: 14, boxShadow: SH.card }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 12 }}>📊 Work Analysis</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {analysis.length === 0 ? (
              <div style={{ fontSize: 12, color: T.inkSoft, padding: "10px 0" }}>No jobs analyzed yet.</div>
            ) : (
              analysis.map(item => (
                <div key={item.name} style={{ flexShrink: 0, padding: "10px 14px", borderRadius: R.md, background: T.bgSoft, border: `1px solid ${T.line}`, textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{item.count}</div>
                  <div style={{ fontSize: 10, color: T.inkSoft, fontWeight: 600, marginTop: 2 }}>{item.name}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 10, paddingLeft: 4 }}>History</div>
        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9FB3AD" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💼</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{search ? "No results" : "No work records"}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Tap + to add your first job</div>
          </div>
        )}

        {visible.map(record => {
          const isExpanded = expandedId === record.id;
          return (
            <motion.div key={record.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: visible.indexOf(record) * 0.045, duration: 0.28, ease: [0.22, 1, 0.36, 1] }} whileTap={{ scale: 0.992 }} onClick={() => setExpandedId(isExpanded ? null : record.id)} className="smooth-card" style={{
              background: T.card, borderRadius: R.lg, padding: "12px", marginBottom: 12, boxShadow: SH.card,
              borderLeft: `4px solid ${record.status === "paid" ? T.income : record.status === "unpaid" ? T.expense : T.gold}`,
              cursor: "pointer", transition: "all 0.2s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: R.md, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {record.type === "work" ? "💼" : "💸"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.customer || record.name || (record.type === "spend" ? "Spend" : "Work Entry")}</div>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: R.pill, background: T.bgSoft, color: T.inkSoft, textTransform: "uppercase" }}>
                      #{record.code}
                    </span>
                    {record.type === "work" && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: R.pill, background: record.status === "paid" ? T.incomeSoft : record.status === "unpaid" ? T.expenseSoft : T.goldSoft, color: record.status === "paid" ? "#1E8E5A" : record.status === "unpaid" ? T.expense : "#946A1F", textTransform: "uppercase" }}>
                        {record.status}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2 }}>{record.name}</div>
                  <div style={{ fontSize: 11, color: "#A8B8B3", marginTop: 1 }}>{record.date} {record.status === "paid" && `· ${record.method}`}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: record.type === "spend" ? T.expense : T.ink, fontFamily: THEME_CONFIG.font.money }}>{record.type === "spend" ? "−" : ""}{fmt(record.amount)}</div>
                </div>
              </div>

              <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div key="expanded-actions" initial={{ opacity: 0, height: 0, y: -6 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -6 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: "hidden" }}>
                <div onClick={e => e.stopPropagation()} style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    {record.photo ? (
                      <button onClick={() => setViewPhoto(record.photo)} aria-label="View work photo" style={{ width: 52, height: 52, padding: 0, border: `1.5px solid ${T.teal500}`, borderRadius: R.sm, background: T.bgSoft, cursor: "pointer", overflow: "hidden", flexShrink: 0 }}>
                        <img src={record.photo} alt="Work thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: R.sm, border: `1.5px dashed ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📷</div>
                    )}
                    <button onClick={() => setDelId(record.id)} style={{ flex: 1, padding: "10px", borderRadius: R.sm, border: "1.5px solid #FBD5D5", background: T.expenseSoft, color: T.expense, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>🗑 Delete</button>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => record.photo && setViewPhoto(record.photo)} disabled={!record.photo} style={{ flex: 1, padding: "10px", borderRadius: R.sm, border: `1.5px solid ${record.photo ? T.teal500 : T.line}`, background: record.photo ? T.mintSoft : T.bgSoft, color: record.photo ? T.teal700 : T.inkSoft, fontSize: 12, fontWeight: 700, cursor: record.photo ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>👁️ View Photo</button>
                    <label style={{ flex: 1, padding: "10px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.card, color: T.teal500, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      📷 Add Photo
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        compressImage(file, (compressed) => {
                          setWorkRecords(prev => prev.map(w => w.id === record.id ? { ...w, photo: compressed } : w));
                        });
                        e.target.value = "";
                      }} style={{ display: "none" }} />
                    </label>
                  </div>
                  <button onClick={() => openEdit(record)} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: "#F0F6FF", color: T.teal500, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>✏️ Edit Entry</button>
                </div>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <button onClick={openAdd} style={{ position: "fixed", bottom: 90, right: "max(16px, calc(50% - 210px + 16px))", width: 58, height: 58, borderRadius: R.pill, background: G.gold, color: T.teal900, fontSize: 28, border: "none", cursor: "pointer", fontWeight: 700, boxShadow: "0 8px 22px rgba(232,199,126,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>

      <AnimatePresence>
        {viewPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => setViewPhoto(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} src={viewPhoto} alt="Work Photo" style={{ maxWidth: "100%", maxHeight: "80%", borderRadius: R.lg, boxShadow: "0 0 30px rgba(0,0,0,0.5)" }} />
            <button onClick={() => setViewPhoto(null)} style={{ position: "absolute", top: 30, right: 20, background: "white", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, fontWeight: 700, cursor: "pointer" }}>✕</button>
          </motion.div>
        )}
        {delId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ position: "fixed", inset: 0, background: "rgba(10,26,24,0.55)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(2px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ type: "spring", stiffness: 360, damping: 28 }} style={{ background: T.card, borderRadius: R.xl, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center", boxShadow: SH.raised }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.ink }}>Are you sure you want to delete this work entry? This cannot be undone.</div>
              <div style={{ fontSize: 13, color: T.inkSoft, marginBottom: 22 }}>This action cannot be undone.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <FBtn onClick={() => setDelId(null)} outline color={T.inkSoft} style={{ flex: 1 }}>Cancel</FBtn>
                <FBtn onClick={() => { deleteWorkRecord(delId); setDelId(null); }} bg={G.expense} style={{ flex: 1 }}>Delete</FBtn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={showSheet} onClose={() => setShowSheet(false)}>
        <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, marginBottom: 14, fontFamily: THEME_CONFIG.font.money }}>{editId ? "Edit Record" : "New Work Record"}</div>
        {editId ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "10px 14px", borderRadius: R.sm, background: form.type === "spend" ? T.expenseSoft : T.mintSoft, border: `1.5px solid ${form.type === "spend" ? T.expense : T.teal500}` }}>
            <span style={{ fontSize: 16 }}>{form.type === "spend" ? "💸" : "💼"}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: form.type === "spend" ? T.expense : T.teal700 }}>{form.type === "spend" ? "Spend Entry" : "Work Entry"}</span>
            <span style={{ fontSize: 11, color: T.inkSoft, marginLeft: 4 }}>(type locked on edit)</span>
          </div>
        ) : (
          <TypeToggle options={[["work", "💼 Work"], ["spend", "💸 Spend"]]} value={form.type} onChange={v => setForm({ ...form, type: v })} colors={{ work: G.primary, spend: G.expense }} />
        )}

        {form.type === "work" && (
          <>
            <Label>WORK NAME</Label>
            {workNames.length === 0 ? (
              <div style={{ fontSize: 12, color: "#946A1F", marginBottom: 12, padding: "10px 12px", background: T.goldSoft, borderRadius: R.sm }}>⚠️ No work names. Add them in Settings.</div>
            ) : (
              <ChipRow items={workNames} selected={form.name} onSelect={v => setForm({ ...form, name: v })} />
            )}
          </>
        )}

        <Label>{form.type === "spend" ? "DESCRIPTION (OPTIONAL)" : "CUSTOMER NAME (OPTIONAL)"}</Label>
        <FInput value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder={form.type === "spend" ? "e.g. Tools, Fuel, Supplies…" : "Enter customer name (optional)"} style={{ marginBottom: 10 }} />

        {form.type === "work" && (
          <>
            <Label>PAYMENT STATUS</Label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {["undecided", "unpaid", "paid"].map(s => (
                <button key={s} onClick={() => setForm({ ...form, status: s })} style={{ flex: 1, padding: "10px", border: "1.5px solid", borderRadius: R.sm, cursor: "pointer", fontWeight: 700, fontSize: 11, fontFamily: THEME_CONFIG.font.body, borderColor: form.status === s ? T.teal500 : T.line, background: form.status === s ? T.mintSoft : T.card, color: form.status === s ? T.teal700 : T.inkSoft, textTransform: "capitalize" }}>{s}</button>
              ))}
            </div>
            {form.status === "paid" && (
              <>
                <Label>PAYMENT METHOD</Label>
                <ChipRow items={["Online", "Cash"]} selected={form.method} onSelect={v => setForm({ ...form, method: v })} />
              </>
            )}
          </>
        )}

        <Label>{form.type === "spend" ? "SPEND AMOUNT" : "WORK AMOUNT"}</Label>
        <FInput value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="₹ 0" type="number" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, fontFamily: THEME_CONFIG.font.money }} />

        <Label>PHOTO (OPTIONAL)</Label>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <label style={{ flex: 1, padding: "10px 8px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.teal500, cursor: "pointer" }}>
              📷 Camera
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
            <label style={{ flex: 1, padding: "10px 8px", borderRadius: R.sm, border: `1.5px solid ${T.line}`, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.teal500, cursor: "pointer" }}>
              🖼️ Gallery
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
          </div>
          {form.photo && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img src={form.photo} alt="Preview" style={{ width: 48, height: 48, borderRadius: R.sm, objectFit: "cover", border: `1px solid ${T.teal500}` }} />
                <button onClick={() => setForm({ ...form, photo: null })} style={{ position: "absolute", top: -6, right: -6, background: T.expense, color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
              <div style={{ fontSize: 12, color: T.inkSoft }}>Photo attached. Use buttons above to replace.</div>
            </div>
          )}
        </div>

        <Label>DATE</Label>
        <FInput value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} type="date" style={{ marginBottom: 16 }} />
        <FBtn onClick={save} style={{ width: "100%", padding: "15px" }}>{editId ? "Update Record" : "Confirm Entry"}</FBtn>
      </Sheet>
    </div>
  );
}
