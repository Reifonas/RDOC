import{r as d}from"./router-vendor-D4by-_6Z.js";import{s as n}from"./index-doec96Hx.js";const w=()=>{const[g,s]=d.useState(!1),[m,t]=d.useState(null);return{loading:g,error:m,validarConvite:async i=>{try{s(!0),t(null);const e=i.toUpperCase().trim(),{data:r,error:a}=await n.from("convites").select(`
                    id,
                    codigo,
                    organizacao_id,
                    role,
                    max_usos,
                    usos_atuais,
                    ativo,
                    expira_em,
                    email_convidado,
                    organizacoes:organizacao_id (nome)
                `).eq("codigo",e).eq("ativo",!0).single();if(a||!r)return{success:!1,error:"Código de convite inválido ou expirado."};const o=r;return o.expira_em&&new Date(o.expira_em)<new Date?{success:!1,error:"Este código de convite expirou."}:o.max_usos>0&&o.usos_atuais>=o.max_usos?{success:!1,error:"Este código de convite já atingiu o limite de usos."}:{success:!0,organizacao_id:o.organizacao_id,organizacao_nome:o.organizacoes?.nome||"Organização",role:o.role}}catch(e){const r=e instanceof Error?e.message:"Erro ao validar convite";return t(r),{success:!1,error:r}}finally{s(!1)}},usarConvite:async(i,e)=>{try{s(!0),t(null);const{data:r,error:a}=await n.rpc("usar_convite",{p_codigo:i,p_usuario_id:e});if(a)throw a;const o=r;return o.success||t(o.error||"Erro ao usar convite"),o}catch(r){const a=r instanceof Error?r.message:"Erro ao usar convite";return t(a),{success:!1,error:a}}finally{s(!1)}},gerarConvite:async(i,e={})=>{try{s(!0),t(null);const{data:r,error:a}=await n.rpc("gerar_codigo_convite");if(a)throw a;const o=r;let u=null;if(e.expiraEmDias){const c=new Date;c.setDate(c.getDate()+e.expiraEmDias),u=c.toISOString()}const{data:{user:f}}=await n.auth.getUser(),{error:l}=await n.from("convites").insert({organizacao_id:i,codigo:o,criado_por:f?.id,email_convidado:e.emailConvidado||null,role:e.role||"usuario",max_usos:e.maxUsos??1,expira_em:u});if(l)throw l;return{success:!0,codigo:o}}catch(r){const a=r instanceof Error?r.message:"Erro ao gerar convite";return t(a),{success:!1,error:a}}finally{s(!1)}},listarConvites:async i=>{try{s(!0);const{data:e,error:r}=await n.from("convites").select("*").eq("organizacao_id",i).order("created_at",{ascending:!1});if(r)throw r;return e||[]}catch{return[]}finally{s(!1)}}}};export{w as u};
