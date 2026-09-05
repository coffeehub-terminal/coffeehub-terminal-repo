"use client"
const getFlag = (origin:string) => {
  const o=(origin||"").toLowerCase()
  if(o.includes("colombia") || o.includes("colom") || o.includes("buenaventura")) return "🇨🇴";
  if(o.includes("brazil") || o.includes("brasil") || o.includes("santos")) return "🇧🇷";
  if(o.includes("ethiopia")) return "🇪🇹";
  if(o.includes("trieste") || o.includes("italy") || o.includes("italia")) return "🇮🇹";
  if(o.includes("hamburg") || o.includes("germany")) return "🇩🇪";
  if(o.includes("amsterdam") || o.includes("netherlands") || o.includes("rotterdam")) return "🇳🇱";
  if(o.includes("honduras")) return "🇭🇳";
  if(o.includes("guatemala")) return "🇬🇹";
  if(o.includes("kenya")) return "🇰🇪";
  return "🌎"
}
import { useState, useMemo } from "react"

type Contact = { id:number, name:string, company:string, badge?:string, type:string, category:string, location:string, spot:string, stock:string, contact:string }

const SEED: Contact[] = [
  {id:1,name:"Logistics Santos",company:"Santos Logistics Co Santos",type:"contact_origin",category:"logistics",location:"Santos",spot:"ORIGIN",stock:"0 bags",contact:"+55 13 99999999"},
  {id:2,name:"Coop - Caturra Collective",company:"Caturra Collective Pitalito",badge:"COOP",type:"contact_origin",category:"cooperative",location:"Origin",spot:"ORIGIN",stock:"1200 bags",contact:"+57 310 123456"},
  {id:3,name:"Spot Holder Hamburg",company:"Benecke Coffee Hamburg",type:"contact_spot",category:"supplier",location:"Hamburg",spot:"SPOT",stock:"350 bags",contact:"+49 171 987654"},
  {id:4,name:"Spot Trieste - Mogiana",company:"Gruppo Trieste Trieste",type:"contact_spot",category:"supplier",location:"Trieste",spot:"SPOT",stock:"800 bags",contact:"+39 340 111222"},
  {id:5,name:"Roaster Buyer Amsterdam",company:"Amsterdam Roasters Amsterdam",type:"contact_spot",category:"roaster",location:"Amsterdam",spot:"SPOT",stock:"0 bags",contact:"+31 6 12345678"},
  {id:6,name:"My Stock - Huila Washed",company:"CoffeeHub Own P&L Trieste",type:"my_own",category:"trader",location:"Trieste",spot:"SPOT",stock:"420 bags",contact:"+39 333 123456"},
  {id:7,name:"Cooperativa Huila",company:"Coop Huila Pitalito Pitalito",type:"contact_origin",category:"",location:"Buenaventura",spot:"SPOT",stock:"500 bags",contact:"+57 310 123456"},
  {id:8,name:"Santos Export",company:"Brazil Santos Santos",type:"contact_spot",category:"",location:"Santos",spot:"SPOT",stock:"2000 bags",contact:"+55 11 999999999"},
  {id:9,name:"Hamburg Coffee",company:"HC GmbH Hamburg",type:"contact_spot",category:"",location:"Hamburg",spot:"SPOT",stock:"800 bags",contact:"+49 40 1234456"},
  {id:10,name:"Mario Rossi",company:"Rossi Trading SRL Trieste",type:"contact_spot",category:"",location:"Trieste",spot:"SPOT",stock:"3200 bags",contact:"+39 333 123456"},
]

export default function CrmPanel(){
  const [contacts,setContacts]=useState<Contact[]>(SEED)
  const [type,setType]=useState('all'); const [cat,setCat]=useState('all'); const [loc,setLoc]=useState('all')
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({name:"",company:"",type:"contact_spot",category:"supplier",location:"Trieste",spot:"SPOT",stock:"",contact:"",city:"",country:"",email:"",origin:"",notes:""})

  const filtered = useMemo(()=> contacts.filter(c=>{ if(type!=='all' && c.type!==type) return false; if(cat!=='all' && c.category!==cat) return false; if(loc!=='all' && c.location!==loc) return false; return true }),[contacts,type,cat,loc])

  function handleAdd(){
    if(!form.name.trim()) return alert("Supplier Name required")
    const newC: Contact = {id:Date.now(), name:form.name, company:form.company||form.name, type:form.type, category:form.category, location:form.location||form.city||"Trieste", spot:"SPOT", stock:form.stock||"0 bags", contact:form.contact||""}
    setContacts([newC,...contacts]); setShow(false)
    setForm({name:"",company:"",type:"contact_spot",category:"supplier",location:"Trieste",spot:"SPOT",stock:"",contact:"",city:"",country:"",email:"",origin:"",notes:""})
  }

  return (
    <div className="w-full bg-white">
      <div className="flex flex-wrap gap-3 items-center py-4">
        <select value={type} onChange={e=>setType(e.target.value)} className="h-9 rounded-full border border-black px-4 text-sm bg-white"><option value="all">All Types</option><option value="contact_origin">contact_origin</option><option value="contact_spot">contact_spot</option><option value="my_own">my_own</option></select>
        <select value={cat} onChange={e=>setCat(e.target.value)} className="h-9 rounded-full border border-black px-4 text-sm bg-white font-medium"><option value="all">All Categories</option><option value="supplier">supplier</option><option value="cooperative">cooperative</option><option value="logistics">logistics</option><option value="roaster">roaster</option><option value="trader">trader</option></select>
        <select value={loc} onChange={e=>setLoc(e.target.value)} className="h-9 rounded-full border border-black px-4 text-sm bg-white"><option value="all">All Locations</option><option value="Santos">Santos</option><option value="Hamburg">Hamburg</option><option value="Trieste">Trieste</option><option value="Buenaventura">Buenaventura</option><option value="Amsterdam">Amsterdam</option><option value="Origin">Origin</option></select>
        <div className="ml-auto flex items-center gap-3"><button onClick={()=>setShow(true)} className="h-9 px-5 rounded-full bg-black text-white text-sm cursor-pointer">+ Add Supplier</button><span className="text-sm text-neutral-500">{filtered.length} contacts</span></div>
      </div>

      <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_0.7fr_1fr] gap-4 px-4 h-10 items-center text-xs uppercase tracking-widest text-neutral-500 border-b border-black/10"><div>NAME / COMPANY</div><div>TYPE / CATEGORY</div><div>LOCATION_SPOT</div><div>STOCK</div><div>CONTACT</div></div>
      <div className="divide-y divide-black/10 border border-black rounded-2xl overflow-hidden mt-2 bg-white">
        {filtered.map(r=>(
          <div key={r.id} className="grid md:grid-cols-[1.5fr_1fr_1fr_0.7fr_1fr] gap-4 px-4 py-4 hover:bg-neutral-50 bg-white">
            <div><div className="font-medium flex gap-2 text-[13px] text-black">{getFlag(r.location || r.company || "")} {r.name} {r.badge && <span className="px-1.5 py-0.5 rounded bg-amber-100 border text-[10px] text-black">{r.badge}</span>}</div><div className="text-xs text-neutral-500">{r.company}</div></div>
            <div className="flex flex-col gap-1"><span className="w-fit px-2.5 py-1 rounded-full bg-black text-white text-[11px]">{r.type}</span>{r.category && <span className="w-fit px-2.5 py-1 rounded-full border border-black text-[11px] text-black">{r.category}</span>}</div>
            <div className="text-sm text-black">{getFlag(r.location)} {r.location} <span className="text-xs text-neutral-500 ml-1">{r.spot}</span></div>
            <div className="text-sm text-black">{r.stock}</div>
            <div className="text-sm text-green-600 font-medium">{r.contact}</div>
          </div>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={()=>setShow(false)}>
          <div className="bg-white border border-black rounded-[20px] w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-6 shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-black font-bold tracking-widest text-[14px]">+ ADD SUPPLIER</h2>
              <button onClick={()=>setShow(false)} className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-black">✕</button>
            </div>

            <div className="space-y-4">
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Supplier Name *" className="w-full h-[48px] rounded-full border border-black bg-white px-5 text-black placeholder:text-neutral-500 focus:outline-none text-[14px]"/>

              <div className="grid grid-cols-2 gap-4">
                <input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company" className="h-[44px] rounded-full border border-black/20 bg-white px-4 text-black placeholder:text-neutral-500 text-[13px] outline-none"/>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="h-[44px] rounded-full border border-black/20 bg-white px-4 text-black text-[13px] outline-none">
                  <option value="contact_spot">TYPE: Spot</option>
                  <option value="contact_origin">TYPE: Origin</option>
                  <option value="my_own">TYPE: My Own</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="h-[44px] rounded-full border border-black bg-white px-4 text-black text-[13px] outline-none font-medium">
                  <option value="supplier">Supplier</option>
                  <option value="cooperative">Cooperative</option>
                  <option value="logistics">Logistics</option>
                  <option value="roaster">Roaster</option>
                  <option value="trader">Trader</option>
                </select>
                <select value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="h-[44px] rounded-full border border-black/20 bg-white px-4 text-black text-[13px] outline-none">
                  <option value="Trieste">Trieste</option>
                  <option value="Hamburg">Hamburg</option>
                  <option value="Santos">Santos</option>
                  <option value="Amsterdam">Amsterdam</option>
                  <option value="Origin">Origin</option>
                  <option value="Buenaventura">Buenaventura</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="City" className="h-[44px] rounded-full border border-black/20 bg-white px-4 text-black placeholder:text-neutral-500 text-[13px] outline-none"/>
                <input value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="Country" className="h-[44px] rounded-full border border-black/20 bg-white px-4 text-black placeholder:text-neutral-500 text-[13px] outline-none"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="Stock bags" className="h-[44px] rounded-full border border-black/20 bg-white px-4 text-black placeholder:text-neutral-500 text-[13px] outline-none"/>
                <input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="WhatsApp" className="h-[44px] rounded-full border border-black/20 bg-white px-4 text-black placeholder:text-neutral-500 text-[13px] outline-none"/>
              </div>

              <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-[44px] rounded-full border border-black/20 bg-white px-4 text-black placeholder:text-neutral-500 text-[13px] outline-none"/>

              <input value={form.origin} onChange={e=>setForm({...form,origin:e.target.value})} placeholder="Origin" className="w-full h-[44px] rounded-full border border-black/20 bg-white px-4 text-black placeholder:text-neutral-500 text-[13px] outline-none"/>

              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Notes" className="w-full min-h-[80px] rounded-[20px] border border-black/20 bg-white px-4 py-3 text-black placeholder:text-neutral-500 text-[13px] outline-none resize-none"/>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={()=>setShow(false)} className="h-[44px] px-6 rounded-full border border-black bg-white text-black text-[13px]">Cancel</button>
                <button onClick={handleAdd} className="h-[44px] px-8 rounded-full bg-black text-white font-bold text-[13px] hover:bg-black/90">+ ADD SUPPLIER</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
