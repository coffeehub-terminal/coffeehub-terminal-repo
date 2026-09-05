import { Resend } from "resend"
export async function POST(req:Request){
  try{
    const {sampleId, status, courier, tracking}=await req.json()
    if(!process.env.RESEND_API_KEY) return Response.json({ok:true,mock:true})
    const resend=new Resend(process.env.RESEND_API_KEY)
    // You can notify buyer that green bar moved
    return Response.json({ok:true})
  }catch(e:any){ return Response.json({ok:true,error:e.message}) }
}
