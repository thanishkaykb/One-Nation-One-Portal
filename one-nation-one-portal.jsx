import { useState, useEffect, useRef } from "react";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',sans-serif;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
@keyframes ticker{0%{opacity:0;transform:translateY(6px);}15%{opacity:1;transform:translateY(0);}85%{opacity:1;}100%{opacity:0;transform:translateY(-6px);}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.4);}70%{box-shadow:0 0 0 8px rgba(37,211,102,0);}}
.fu{animation:fadeUp .4s ease forwards;}
.si{animation:slideIn .3s ease forwards;}
.tk{animation:ticker 4.5s ease infinite;}
.pulse{animation:pulse 2s infinite;}
`;

const SCHEMES = [
  {id:1,name:"PM Kisan Samman Nidhi",min:"Ministry of Agriculture",benefit:"₹6,000/year",desc:"₹2,000 every 4 months directly to small and marginal farmers' bank accounts.",link:"https://pmkisan.gov.in",tags:["Farmer","Rural","BPL"],incLimit:200000,minAge:18,maxAge:99,gender:"any",area:"rural",elig:["Farmer with cultivable land","Annual income < ₹2 lakh","Valid bank account linked to Aadhaar"]},
  {id:2,name:"PM Fasal Bima Yojana",min:"Ministry of Agriculture",benefit:"Full crop insurance coverage",desc:"Crop insurance against natural calamities, pests and diseases at subsidised premium.",link:"https://pmfby.gov.in",tags:["Farmer","Rural"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"rural",elig:["Active farmer","Cultivable land","Enroll before sowing season"]},
  {id:3,name:"Kisan Credit Card",min:"NABARD / Banks",benefit:"Credit up to ₹3 lakh @ 4% interest",desc:"Flexible credit for crop cultivation, allied activities and farm asset maintenance.",link:"https://www.nabard.org",tags:["Farmer","Rural"],incLimit:999999,minAge:18,maxAge:70,gender:"any",area:"rural",elig:["Farmer/sharecropper","Land records required","Bank account"]},
  {id:4,name:"Soil Health Card Scheme",min:"Ministry of Agriculture",benefit:"Free soil testing + fertiliser advisory",desc:"Soil health cards with crop-wise nutrient recommendations for better yields.",link:"https://soilhealth.dac.gov.in",tags:["Farmer","Rural"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"rural",elig:["Any farmer with agricultural land"]},
  {id:5,name:"PM Krishi Sinchai Yojana",min:"Ministry of Agriculture",benefit:"Irrigation subsidy up to 55%",desc:"End-to-end irrigation solutions including source creation and distribution.",link:"https://pmksy.gov.in",tags:["Farmer","Rural"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"rural",elig:["Land-owning farmer","Water source available"]},
  {id:6,name:"eNAM – National Agriculture Market",min:"SFAC",benefit:"Online crop trading platform",desc:"Pan-India electronic trading portal networking APMC mandis for better price discovery.",link:"https://enam.gov.in",tags:["Farmer"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"any",elig:["Farmer with APMC registration","Aadhaar-linked bank account"]},
  {id:7,name:"PM Kisan Maan Dhan Yojana",min:"Ministry of Agriculture",benefit:"₹3,000/month pension after age 60",desc:"Voluntary pension scheme for small/marginal farmers joining between age 18–40.",link:"https://pmkmy.gov.in",tags:["Farmer","Rural","Elderly"],incLimit:200000,minAge:18,maxAge:40,gender:"any",area:"rural",elig:["Small/marginal farmer","Age 18–40","Land < 2 hectares"]},
  {id:8,name:"National Livestock Mission",min:"Ministry of Animal Husbandry",benefit:"Subsidy up to 50% on enterprise cost",desc:"Sustainable development of livestock sector – cattle, poultry, goat, piggery.",link:"https://nlm.udyamimitra.in",tags:["Farmer","Rural","Self-Employed"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"rural",elig:["Livestock farmer","SC/ST get higher subsidy"]},
  {id:9,name:"PM Matsya Sampada Yojana",min:"Ministry of Fisheries",benefit:"Subsidy 40–60% on fishery infrastructure",desc:"Sustainable fisheries development for fishermen and fish farmers.",link:"https://dof.gov.in",tags:["Farmer","Rural","Self-Employed"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"any",elig:["Fisherman/fish farmer","Valid fisherman ID card"]},
  {id:10,name:"Paramparagat Krishi Vikas Yojana",min:"Ministry of Agriculture",benefit:"₹50,000/hectare organic farming support",desc:"Promotes organic farming through cluster approach with capacity building.",link:"https://pgsindia-ncof.gov.in",tags:["Farmer","Rural"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"rural",elig:["Farmer joining organic cluster","Minimum 20 farmers per cluster"]},
  {id:11,name:"Ayushman Bharat PM-JAY",min:"National Health Authority",benefit:"₹5 lakh health cover/family/year",desc:"World's largest health insurance – free secondary and tertiary care at 27,000+ hospitals.",link:"https://pmjay.gov.in",tags:["Health","BPL"],incLimit:200000,minAge:0,maxAge:99,gender:"any",area:"any",elig:["SECC 2011 listed family","BPL household","No existing govt health cover"]},
  {id:12,name:"Janani Suraksha Yojana",min:"Ministry of Health",benefit:"₹600–₹1,400 cash for institutional delivery",desc:"Cash incentive for pregnant women to deliver at government hospitals.",link:"https://nhm.gov.in",tags:["Health","Women","BPL"],incLimit:200000,minAge:19,maxAge:49,gender:"female",area:"any",elig:["Pregnant woman","BPL/SC/ST household","Age ≥ 19","First two live births"]},
  {id:13,name:"PM Matru Vandana Yojana",min:"Ministry of Women & Child",benefit:"₹5,000 maternity benefit",desc:"Partial wage compensation for pregnant and lactating mothers for first live birth.",link:"https://wcd.nic.in",tags:["Health","Women"],incLimit:999999,minAge:19,maxAge:49,gender:"female",area:"any",elig:["Pregnant/lactating mother","First live birth","Age ≥ 19","Not a central govt employee"]},
  {id:14,name:"ESIC Medical Benefits",min:"Ministry of Labour",benefit:"Free comprehensive medical care + cash benefits",desc:"Medical and cash benefits for insured employees and their dependents.",link:"https://esic.gov.in",tags:["Health","Employed"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"urban",elig:["ESIC registered employee","Salary ≤ ₹21,000/month"]},
  {id:15,name:"ABHA Health ID",min:"National Health Authority",benefit:"Unified digital health record",desc:"14-digit Ayushman Bharat Health Account linking all medical records digitally.",link:"https://abha.abdm.gov.in",tags:["Health","Digital"],incLimit:999999,minAge:0,maxAge:99,gender:"any",area:"any",elig:["Any Indian citizen","Aadhaar or mobile number"]},
  {id:16,name:"Jan Aushadhi – Generic Medicines",min:"Ministry of Pharmaceuticals",benefit:"Medicines at 50–90% less price",desc:"Affordable quality generic medicines at 10,000+ Jan Aushadhi Kendras nationwide.",link:"https://janaushadhi.gov.in",tags:["Health"],incLimit:999999,minAge:0,maxAge:99,gender:"any",area:"any",elig:["Any Indian citizen","Visit nearest Jan Aushadhi Kendra"]},
  {id:17,name:"National Scholarship Portal (NSP)",min:"Ministry of Education",benefit:"₹10,000–₹50,000/year",desc:"Single platform for all central government scholarships from pre-matric to PhD.",link:"https://scholarships.gov.in",tags:["Student","Education"],incLimit:800000,minAge:5,maxAge:35,gender:"any",area:"any",elig:["Student in recognised institution","Income < ₹8 lakh/year","Min 50% marks","Aadhaar-linked bank account"]},
  {id:18,name:"PM YASASVI Scholarship",min:"Ministry of Social Justice",benefit:"₹75,000–₹1,25,000/year",desc:"Scholarship for OBC, EBC and DNT students in Class 9–12 and UG courses.",link:"https://yet.nta.ac.in",tags:["Student","OBC","Education"],incLimit:250000,minAge:13,maxAge:25,gender:"any",area:"any",elig:["OBC/EBC/DNT student","Income < ₹2.5 lakh","Class 9 to UG"]},
  {id:19,name:"AICTE Pragati Scholarship (Girls)",min:"AICTE",benefit:"₹50,000/year + ₹2,000 contingency",desc:"Scholarship for girl students pursuing AICTE-approved technical education.",link:"https://aicte-india.org",tags:["Student","Women","Education"],incLimit:800000,minAge:17,maxAge:30,gender:"female",area:"any",elig:["Girl student","AICTE-approved college","Income < ₹8 lakh","First year of course"]},
  {id:20,name:"AICTE Saksham Scholarship",min:"AICTE",benefit:"₹50,000/year + ₹2,000 contingency",desc:"Scholarship for differently-abled students pursuing technical programmes.",link:"https://aicte-india.org",tags:["Student","Disability","Education"],incLimit:800000,minAge:17,maxAge:30,gender:"any",area:"any",elig:["Differently-abled student","Disability ≥ 40%","AICTE-approved college"]},
  {id:21,name:"Post-Matric SC Scholarship",min:"Ministry of Social Justice",benefit:"Full tuition + maintenance allowance",desc:"Financial assistance to SC students at post-matric stage of education.",link:"https://scholarships.gov.in",tags:["Student","SC","Education"],incLimit:250000,minAge:14,maxAge:35,gender:"any",area:"any",elig:["SC student","Income < ₹2.5 lakh","Post-matric institution"]},
  {id:22,name:"Post-Matric ST Scholarship",min:"Ministry of Tribal Affairs",benefit:"Full tuition + maintenance allowance",desc:"Financial assistance to ST students pursuing post-matric education.",link:"https://tribal.nic.in",tags:["Student","ST","Education"],incLimit:250000,minAge:14,maxAge:35,gender:"any",area:"any",elig:["ST student","Income < ₹2.5 lakh","Post-matric institution"]},
  {id:23,name:"Vidya Lakshmi Education Loan",min:"Ministry of Finance / IBA",benefit:"Education loan up to ₹20 lakh",desc:"Apply for education loans from 38 banks simultaneously on one platform.",link:"https://vidyalakshmi.co.in",tags:["Student","Education"],incLimit:999999,minAge:17,maxAge:35,gender:"any",area:"any",elig:["Admission in recognised college","Valid admission letter","Age 17–35"]},
  {id:24,name:"UGC Research Fellowships (JRF/SRF)",min:"University Grants Commission",benefit:"₹31,000–₹35,000/month stipend",desc:"Research fellowships for PhD scholars pursuing research in Indian universities.",link:"https://ugc.ac.in",tags:["Student","Education"],incLimit:999999,minAge:20,maxAge:30,gender:"any",area:"any",elig:["NET/JRF qualified","PhD programme admission","Age ≤ 30"]},
  {id:25,name:"PM Awas Yojana – Urban",min:"Ministry of Housing & Urban Affairs",benefit:"Interest subsidy up to ₹2.67 lakh",desc:"Housing for urban poor – credit-linked subsidy for EWS/LIG/MIG home buyers.",link:"https://pmaymis.gov.in",tags:["Housing","Urban","BPL"],incLimit:1800000,minAge:21,maxAge:70,gender:"any",area:"urban",elig:["Urban resident","No pucca house anywhere","EWS/LIG/MIG income bracket","First-time homebuyer"]},
  {id:26,name:"PM Awas Yojana – Gramin",min:"Ministry of Rural Development",benefit:"₹1.2–₹1.3 lakh house construction aid",desc:"Free/subsidised pucca house construction for BPL rural families.",link:"https://pmayg.nic.in",tags:["Housing","Rural","BPL"],incLimit:200000,minAge:21,maxAge:99,gender:"any",area:"rural",elig:["Rural BPL family","SECC 2011 listed","No pucca house"]},
  {id:27,name:"PM Ujjwala Yojana",min:"Ministry of Petroleum",benefit:"Free LPG connection + first refill",desc:"Clean cooking fuel LPG connection to BPL women for health protection.",link:"https://pmuy.gov.in",tags:["Housing","Women","BPL","Rural"],incLimit:200000,minAge:18,maxAge:99,gender:"female",area:"any",elig:["Woman head of BPL household","No existing LPG connection","Aadhaar and ration card"]},
  {id:28,name:"Jal Jeevan Mission",min:"Ministry of Jal Shakti",benefit:"Piped tap water to every rural home",desc:"Har Ghar Jal – functional household tap connection to all rural households.",link:"https://jaljeevenmission.gov.in",tags:["Housing","Rural"],incLimit:999999,minAge:0,maxAge:99,gender:"any",area:"rural",elig:["Rural household","No existing tap water connection"]},
  {id:29,name:"Solar Rooftop Subsidy Scheme",min:"Ministry of New & Renewable Energy",benefit:"Subsidy 20–40% on solar installation",desc:"Financial assistance for rooftop solar panels to reduce electricity bills.",link:"https://solarrooftop.gov.in",tags:["Housing","Urban","Rural"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"any",elig:["Home owner","Valid electricity connection","Rooftop space available"]},
  {id:30,name:"MGNREGA Job Card",min:"Ministry of Rural Development",benefit:"100 days guaranteed wage employment",desc:"Guaranteed 100 days unskilled manual work at minimum wages per rural household.",link:"https://nrega.nic.in",tags:["Rural","Employment","BPL"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"rural",elig:["Rural adult (18+)","Willing to do unskilled work","Rural resident"]},
  {id:31,name:"PM Kaushal Vikas Yojana 4.0",min:"Ministry of Skill Development",benefit:"Free certification + ₹8,000 reward",desc:"Free industry-relevant skill training and certification to Indian youth.",link:"https://pmkvyofficial.org",tags:["Employment","Youth","Student"],incLimit:999999,minAge:15,maxAge:45,gender:"any",area:"any",elig:["Age 15–45","School dropout or fresher","Aadhaar card","Bank account"]},
  {id:32,name:"PM Mudra Yojana",min:"Ministry of Finance",benefit:"Loan ₹50,000 to ₹10 lakh",desc:"Collateral-free micro-loans for non-farm small businesses – 3 loan tiers.",link:"https://mudra.org.in",tags:["Employment","Self-Employed","Entrepreneur"],incLimit:999999,minAge:18,maxAge:65,gender:"any",area:"any",elig:["Small business owner","Non-farm enterprise","Bank account","Business proof"]},
  {id:33,name:"PM SVANidhi – Street Vendor",min:"Ministry of Housing",benefit:"Loan ₹10,000–₹50,000 collateral-free",desc:"Working capital loan for street vendors to restart livelihoods.",link:"https://pmsvanidhi.mohua.gov.in",tags:["Employment","Urban","Self-Employed"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"urban",elig:["Street vendor","Vending certificate or LoR","Aadhaar","Bank account"]},
  {id:34,name:"e-Shram Card Registration",min:"Ministry of Labour",benefit:"₹2 lakh accident insurance + UAN",desc:"Universal Account Number with insurance and welfare scheme access for unorganised workers.",link:"https://eshram.gov.in",tags:["Employment","Unorganised"],incLimit:999999,minAge:16,maxAge:59,gender:"any",area:"any",elig:["Unorganised sector worker","Age 16–59","Not EPFO/ESIC member","Income tax non-payer"]},
  {id:35,name:"Stand Up India",min:"SIDBI",benefit:"Bank loan ₹10 lakh to ₹1 crore",desc:"Loans for SC/ST and women entrepreneurs for greenfield enterprise in manufacturing/services.",link:"https://standupmitra.in",tags:["Employment","SC","ST","Women","Entrepreneur"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"any",elig:["SC/ST or woman borrower","First-time greenfield enterprise","Age ≥ 18","Not NPA"]},
  {id:36,name:"DDU-Grameen Kaushalya Yojana",min:"Ministry of Rural Development",benefit:"Free training + guaranteed placement",desc:"Placement-linked residential skill training for rural youth from poor families.",link:"https://ddugky.gov.in",tags:["Rural","Employment","Youth"],incLimit:999999,minAge:15,maxAge:35,gender:"any",area:"rural",elig:["Rural youth 15–35","SECC/BPL household","Ready for residential training"]},
  {id:37,name:"PM Employment Generation Programme",min:"Ministry of MSME",benefit:"Subsidy 15–35% on project cost",desc:"Credit-linked subsidy for new micro enterprises in non-farm sector.",link:"https://kviconline.gov.in",tags:["Employment","Self-Employed","Rural","Urban"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"any",elig:["Age ≥ 18","8th class pass","Project cost ≤ ₹50 lakh"]},
  {id:38,name:"Jan Dhan Yojana",min:"Ministry of Finance",benefit:"Zero-balance account + ₹2L insurance + RuPay",desc:"Universal bank account with RuPay debit card, accident insurance and life cover.",link:"https://pmjdy.gov.in",tags:["Financial","BPL"],incLimit:999999,minAge:10,maxAge:99,gender:"any",area:"any",elig:["Indian citizen","No existing bank account","Aadhaar or any valid ID"]},
  {id:39,name:"Sukanya Samriddhi Yojana",min:"Ministry of Finance",benefit:"7.6% tax-free interest on savings",desc:"High-interest savings scheme for girl child's education and marriage expenses.",link:"https://www.indiapost.gov.in",tags:["Financial","Women","Child"],incLimit:999999,minAge:0,maxAge:10,gender:"female",area:"any",elig:["Girl child below 10 years","Max 2 daughters","Parent or guardian opens account"]},
  {id:40,name:"PM Jeevan Jyoti Bima Yojana",min:"Ministry of Finance",benefit:"₹2 lakh life cover @ ₹436/year",desc:"Renewable annual life insurance at minimal premium for bank account holders.",link:"https://jansuraksha.gov.in",tags:["Financial","Insurance"],incLimit:999999,minAge:18,maxAge:50,gender:"any",area:"any",elig:["Age 18–50","Savings bank account","Aadhaar linked to account"]},
  {id:41,name:"PM Suraksha Bima Yojana",min:"Ministry of Finance",benefit:"₹2 lakh accident cover @ ₹20/year",desc:"Accidental death and disability insurance at India's lowest premium.",link:"https://jansuraksha.gov.in",tags:["Financial","Insurance"],incLimit:999999,minAge:18,maxAge:70,gender:"any",area:"any",elig:["Age 18–70","Savings bank account","Auto-debit consent"]},
  {id:42,name:"Atal Pension Yojana",min:"PFRDA",benefit:"Guaranteed pension ₹1,000–₹5,000/month",desc:"Minimum guaranteed pension for unorganised sector workers after age 60.",link:"https://npscra.nsdl.co.in",tags:["Financial","Unorganised","Elderly"],incLimit:999999,minAge:18,maxAge:40,gender:"any",area:"any",elig:["Age 18–40","Indian citizen","Not income tax payer","Bank account"]},
  {id:43,name:"PPF – Public Provident Fund",min:"Ministry of Finance",benefit:"7.1% tax-free interest, 80C deduction",desc:"15-year tax-saving savings scheme with guaranteed returns.",link:"https://www.indiapost.gov.in",tags:["Financial"],incLimit:999999,minAge:0,maxAge:99,gender:"any",area:"any",elig:["Indian resident","Min ₹500/year deposit","One account per person"]},
  {id:44,name:"PM Vaya Vandana Yojana",min:"LIC of India",benefit:"Assured 7.4% return pension",desc:"Senior citizen pension plan with guaranteed returns and protection against market volatility.",link:"https://licindia.in",tags:["Financial","Elderly"],incLimit:999999,minAge:60,maxAge:99,gender:"any",area:"any",elig:["Age ≥ 60","Investment up to ₹15 lakh"]},
  {id:45,name:"EPFO – Provident Fund",min:"EPFO",benefit:"Retirement corpus + 8.15% interest",desc:"Employee provident fund with employer contribution for retirement savings.",link:"https://unifiedportal-mem.epfindia.gov.in",tags:["Financial","Employed"],incLimit:999999,minAge:18,maxAge:58,gender:"any",area:"any",elig:["Salaried employee","Organisation with 20+ employees","UAN activation required"]},
  {id:46,name:"National Social Assistance Programme",min:"Ministry of Rural Development",benefit:"₹200–₹500/month pension",desc:"Social assistance pension for BPL elderly, widows and disabled persons.",link:"https://nsap.nic.in",tags:["Financial","BPL","Elderly","Women","Disability"],incLimit:100000,minAge:18,maxAge:99,gender:"any",area:"any",elig:["BPL household","Elderly ≥ 60 / Widow / Disabled","SECC listed"]},
  {id:47,name:"Beti Bachao Beti Padhao",min:"Ministry of Women & Child",benefit:"Girl child education and welfare incentives",desc:"Multi-sector programme addressing declining child sex ratio and promoting girl education.",link:"https://wcd.nic.in",tags:["Women","Child","Education"],incLimit:999999,minAge:0,maxAge:18,gender:"female",area:"any",elig:["Girl child or expecting parents","Any Indian family"]},
  {id:48,name:"PM Poshan – Anganwadi Services",min:"Ministry of Women & Child",benefit:"Free nutrition, immunisation, pre-school education",desc:"Supplementary nutrition and early childhood care at Anganwadi centres.",link:"https://wcd.nic.in",tags:["Women","Child","Health"],incLimit:999999,minAge:0,maxAge:6,gender:"any",area:"any",elig:["Child 0–6 years","Pregnant/lactating mother","Register at Anganwadi centre"]},
  {id:49,name:"One Stop Centre (Sakhi)",min:"Ministry of Women & Child",benefit:"Free legal, medical, police and shelter support",desc:"Integrated support centre for women affected by violence of any form.",link:"https://wcd.nic.in",tags:["Women"],incLimit:999999,minAge:18,maxAge:99,gender:"female",area:"any",elig:["Woman affected by violence","No income criteria","Call 181 helpline"]},
  {id:50,name:"Working Women Hostel Scheme",min:"Ministry of Women & Child",benefit:"Safe subsidised hostel accommodation",desc:"Affordable accommodation for working women away from home in cities.",link:"https://wcd.nic.in",tags:["Women","Employment"],incLimit:600000,minAge:18,maxAge:99,gender:"female",area:"urban",elig:["Working woman","Income < ₹50,000/month","Away from hometown"]},
  {id:51,name:"ADIP Scheme – Assistive Devices",min:"Ministry of Social Justice",benefit:"Free assistive devices for disabled persons",desc:"Durable scientific aids for persons with disabilities at free or subsidised cost.",link:"https://socialjustice.gov.in",tags:["Disability"],incLimit:200000,minAge:0,maxAge:99,gender:"any",area:"any",elig:["Person with ≥ 40% disability","Income < ₹2 lakh","UDID card or disability certificate"]},
  {id:52,name:"NHFDC Loans for Disabled",min:"Ministry of Social Justice",benefit:"Loan at 5% interest for livelihood",desc:"Concessional financial assistance to persons with disabilities for economic activities.",link:"https://nhfdc.nic.in",tags:["Disability","Employment"],incLimit:300000,minAge:18,maxAge:55,gender:"any",area:"any",elig:["Person with disability","Income < ₹3 lakh","UDID card"]},
  {id:53,name:"Startup India Initiative",min:"DPIIT",benefit:"Tax holiday + funding + IPR support",desc:"Complete ecosystem for startups – recognition, tax exemption, fund-of-funds, mentorship.",link:"https://startupindia.gov.in",tags:["Employment","Youth","Entrepreneur"],incLimit:999999,minAge:18,maxAge:99,gender:"any",area:"any",elig:["Registered Indian company","< 10 years old","Annual turnover < ₹100 crore","Innovative/scalable model"]},
  {id:54,name:"National Career Service Portal",min:"Ministry of Labour",benefit:"Free job matching + career counselling",desc:"Integrated portal for job seekers with listings, guidance, apprenticeships and training.",link:"https://ncs.gov.in",tags:["Employment","Youth"],incLimit:999999,minAge:15,maxAge:99,gender:"any",area:"any",elig:["Any job seeker","Aadhaar card","Educational certificates"]},
  {id:55,name:"PM Scholarship Scheme (CAPF/RPF)",min:"Ministry of Home Affairs",benefit:"₹2,500–₹3,000/month scholarship",desc:"Scholarship for wards of Central Armed Police Forces and RPF personnel.",link:"https://scholarships.gov.in",tags:["Student","Education"],incLimit:999999,minAge:17,maxAge:25,gender:"any",area:"any",elig:["Ward of CAPF/RPF personnel","First professional degree","Min 60% in qualifying exam"]},
  {id:56,name:"Rashtriya Swasthya Bima Yojana",min:"Ministry of Labour",benefit:"₹30,000 hospitalisation cover/year",desc:"Health insurance for BPL unorganised sector families.",link:"https://labour.gov.in",tags:["Health","BPL","Unorganised"],incLimit:150000,minAge:0,maxAge:99,gender:"any",area:"any",elig:["BPL family","Unorganised sector worker","Smart card from RSBY"]},
  {id:57,name:"PM POSHAN (Mid-Day Meal)",min:"Ministry of Education",benefit:"Free nutritious meal on school days",desc:"Hot cooked meal for Classes 1–8 students in government/government-aided schools.",link:"https://pmposhan.education.gov.in",tags:["Student","Child","Education"],incLimit:999999,minAge:5,maxAge:14,gender:"any",area:"any",elig:["Class 1–8 student","Government/aided school enrolled"]},
  {id:58,name:"Indira Gandhi Matritva Sahyog Yojana",min:"Ministry of Women & Child",benefit:"₹6,000 cash incentive for mothers",desc:"Conditional cash transfer for pregnant and lactating women for better nutrition and care.",link:"https://wcd.nic.in",tags:["Women","Health","BPL"],incLimit:200000,minAge:19,maxAge:45,gender:"female",area:"any",elig:["Pregnant/lactating woman","BPL household","Age ≥ 19","Not central govt employee"]},
  {id:59,name:"National Blindness Control Programme",min:"Ministry of Health",benefit:"Free cataract surgery and spectacles",desc:"Free eye care services including cataract surgery at government hospitals.",link:"https://npcbvi.gov.in",tags:["Health","Disability","Elderly"],incLimit:999999,minAge:0,maxAge:99,gender:"any",area:"any",elig:["Vision impaired person","Government hospital referral"]},
  {id:60,name:"PM-CARES for Children",min:"Ministry of Women & Child",benefit:"PM scholarship + insurance + stipend",desc:"Support for children who lost parents to COVID – education, health and financial support.",link:"https://pmcaresforchildren.in",tags:["Student","Child","Health","BPL"],incLimit:999999,minAge:0,maxAge:23,gender:"any",area:"any",elig:["Child who lost parent(s) to COVID-19","Age ≤ 23 years","Indian citizen"]},
];

const PORTALS = [
  { cat:"🪪 Identity", color:"#c0392b", items:[
    {name:"Aadhaar – Apply / Update / Download",dept:"UIDAI",url:"https://uidai.gov.in",desc:"New Aadhaar enrolment, address/mobile update, e-Aadhaar download, virtual ID, lock biometrics.",docs:["Photo ID proof","Address proof","DOB proof"]},
    {name:"PAN Card – Apply / e-PAN / Link Aadhaar",dept:"Income Tax Dept",url:"https://www.incometax.gov.in",desc:"New PAN, instant e-PAN (free), correction, download e-PAN, PAN-Aadhaar linking.",docs:["Aadhaar","Passport photo","Address proof"]},
    {name:"Passport – Apply / Renew / Track",dept:"MEA – Passport Seva",url:"https://passportindia.gov.in",desc:"Fresh passport, reissue, lost passport, Tatkal, PSK appointment booking, status tracking.",docs:["Aadhaar","DOB proof","Address proof","Old passport (if any)"]},
    {name:"Voter ID – Apply / Correct / Download",dept:"Election Commission of India",url:"https://voters.eci.gov.in",desc:"Form 6 new registration, Form 8 correction, Form 7 deletion, polling booth finder.",docs:["Age proof (18+)","Address proof","Passport photo"]},
    {name:"Driving Licence – Apply / Renew",dept:"MoRTH – Parivahan",url:"https://parivahan.gov.in",desc:"Learner licence, DL, renewal, duplicate, international permit, address update.",docs:["Age proof","Address proof","Medical certificate Form 1A"]},
    {name:"Birth Certificate – Register / Download",dept:"Civil Registration System",url:"https://crsorgi.gov.in",desc:"Register birth within 21 days, delayed registration, download certificate.",docs:["Hospital discharge summary","Parent Aadhaar","Marriage certificate"]},
    {name:"Death Certificate – Register / Download",dept:"Civil Registration System",url:"https://crsorgi.gov.in",desc:"Register death, download certificate for property transfer and insurance.",docs:["Hospital/cremation records","Deceased ID","Informant Aadhaar"]},
    {name:"DigiLocker – Digital Document Wallet",dept:"MeitY",url:"https://digilocker.gov.in",desc:"Store Aadhaar, PAN, Voter ID, DL, marksheets, RC – all verified digitally.",docs:["Aadhaar for signup"]},
    {name:"Caste Certificate – SC/ST/OBC",dept:"State Govt",url:"https://services.india.gov.in",desc:"Apply through state portal for SC/ST/OBC certificate for reservations and scholarships.",docs:["Parent caste certificate","Aadhaar","Address proof"]},
    {name:"Income Certificate",dept:"District Administration",url:"https://services.india.gov.in",desc:"Certificate from Tehsildar/SDM for scholarship, scheme and welfare applications.",docs:["Aadhaar","Salary slip or self-declaration"]},
  ]},
  { cat:"🏥 Health", color:"#1565c0", items:[
    {name:"Ayushman Bharat – Check & Download Card",dept:"NHA",url:"https://pmjay.gov.in",desc:"Check PMJAY eligibility, download Ayushman card, find empanelled hospitals.",docs:["Aadhaar","Ration card"]},
    {name:"ESIC – Register & Benefits",dept:"ESIC",url:"https://esic.gov.in",desc:"Employer/employee registration, claim sickness/maternity/disability benefits.",docs:["Employee ID","Company reg","Aadhaar"]},
    {name:"ABHA Health ID – Create",dept:"NHA – ABDM",url:"https://abha.abdm.gov.in",desc:"14-digit health account for unified digital health records.",docs:["Aadhaar","Mobile number"]},
    {name:"Hospital OPD Appointment (ORS)",dept:"Ministry of Health",url:"https://ors.gov.in",desc:"Book OPD at AIIMS and major government hospitals online.",docs:["ABHA ID or Aadhaar"]},
    {name:"Jan Aushadhi Kendra Locator",dept:"Ministry of Pharma",url:"https://janaushadhi.gov.in",desc:"Find nearest generic medicine store for 50–90% cheaper medications.",docs:[]},
    {name:"NOTTO – Organ Donation",dept:"NOTTO",url:"https://notto.gov.in",desc:"Register as organ donor, download donor card, find transplant centres.",docs:["Aadhaar","Photo"]},
    {name:"Janani Suraksha – Register",dept:"State Health Dept",url:"https://nhm.gov.in",desc:"Register for JSY cash assistance for institutional delivery.",docs:["Aadhaar","BPL card","ANC card"]},
    {name:"NHM – Free Medicines / Diagnostics",dept:"Ministry of Health",url:"https://nhm.gov.in",desc:"Free drugs and diagnostics at government health facilities under NHM.",docs:["Any ID"]},
  ]},
  { cat:"🎓 Education", color:"#1b5e20", items:[
    {name:"National Scholarship Portal – Apply",dept:"Ministry of Education",url:"https://scholarships.gov.in",desc:"All central scholarships – pre-matric to PhD in one application.",docs:["Aadhaar","Bank passbook","Marksheet","Income cert","Caste cert","Enrollment"]},
    {name:"PM YASASVI – Apply via NTA",dept:"NTA",url:"https://yet.nta.ac.in",desc:"OBC/EBC/DNT scholarships for Class 9–12 and UG students.",docs:["Aadhaar","Caste cert","Income cert","Marksheet"]},
    {name:"AICTE Scholarship Portal",dept:"AICTE",url:"https://aicte-india.org",desc:"Pragati (girls) and Saksham (disabled) scholarships for technical education.",docs:["Aadhaar","Admission letter","Income cert","Disability cert (Saksham)"]},
    {name:"Vidya Lakshmi – Education Loan",dept:"Ministry of Finance",url:"https://vidyalakshmi.co.in",desc:"Apply for education loans from 38 banks simultaneously.",docs:["Admission letter","Aadhaar","PAN","Academic records","Income proof"]},
    {name:"NTA – JEE/NEET/CUET Apply",dept:"NTA",url:"https://nta.ac.in",desc:"Apply for JEE Main, NEET UG, CUET and all NTA entrance exams.",docs:["Aadhaar","Class 12 marksheet","Category cert","Photo & signature"]},
    {name:"CBSE – Exam / Result / Certificate",dept:"CBSE",url:"https://cbse.gov.in",desc:"Class 10/12 registration, admit card, result check, migration certificate.",docs:["School enrollment"]},
    {name:"UGC – Fellowships",dept:"UGC",url:"https://ugc.ac.in",desc:"JRF/SRF fellowship, post-doctoral fellowship for research scholars.",docs:["NET/JRF score","PhD letter","Aadhaar","Bank account"]},
    {name:"DigiLocker – Academic Documents",dept:"MeitY",url:"https://digilocker.gov.in",desc:"Download verified CBSE/ICSE marksheets and degree certificates.",docs:["Aadhaar or mobile"]},
  ]},
  { cat:"🌾 Agriculture", color:"#e65100", items:[
    {name:"PM Kisan – Register & Status",dept:"Ministry of Agriculture",url:"https://pmkisan.gov.in",desc:"New registration, beneficiary status, update bank details, Aadhaar seeding.",docs:["Aadhaar","Land records","Bank passbook"]},
    {name:"Kisan Credit Card – Apply",dept:"NABARD",url:"https://www.nabard.org",desc:"Apply at nearest bank/cooperative for farm credit at 4% interest.",docs:["Land records","Aadhaar","Photo","Bank account"]},
    {name:"PM Fasal Bima – Enroll/Claim",dept:"Ministry of Agriculture",url:"https://pmfby.gov.in",desc:"Enroll for crop insurance, file crop loss claims, check status.",docs:["Land records","Aadhaar","Bank account","Sowing cert"]},
    {name:"Soil Health Card – Apply",dept:"Ministry of Agriculture",url:"https://soilhealth.dac.gov.in",desc:"Apply for soil testing, download card with fertiliser recommendations.",docs:["Land details","Aadhaar"]},
    {name:"eNAM – Farmer Registration",dept:"SFAC",url:"https://enam.gov.in",desc:"Register to sell crop online at APMC mandis for better price.",docs:["Aadhaar","Bank account","Land details"]},
    {name:"MGNREGA – Job Card",dept:"Ministry of Rural Development",url:"https://nrega.nic.in",desc:"Apply for job card, demand work, check payment status.",docs:["Aadhaar","Residence proof","Photo"]},
    {name:"eKisan Upaj Nidhi",dept:"NABARD",url:"https://www.nabard.org",desc:"Pledge finance against warehouse receipts for stored agricultural produce.",docs:["Aadhaar","Land records","Warehouse receipt"]},
    {name:"PM Kisan Maan Dhan – Join",dept:"Ministry of Agriculture",url:"https://pmkmy.gov.in",desc:"Join pension scheme for ₹3,000/month after 60 – join age 18–40.",docs:["Aadhaar","Land records","Bank account","Age proof"]},
  ]},
  { cat:"💼 Employment", color:"#4527a0", items:[
    {name:"National Career Service Portal",dept:"Ministry of Labour",url:"https://ncs.gov.in",desc:"Job search, career guidance, apprenticeship, skill training registration.",docs:["Aadhaar","Education certs"]},
    {name:"PMKVY 4.0 – Free Training",dept:"MSDE",url:"https://pmkvyofficial.org",desc:"Find centres, apply for free skill certification in 300+ job roles.",docs:["Aadhaar","Education cert","Bank account"]},
    {name:"e-Shram – Register",dept:"Ministry of Labour",url:"https://eshram.gov.in",desc:"Get UAN + ₹2L accident insurance for unorganised workers.",docs:["Aadhaar","Mobile (linked to Aadhaar)","Bank account"]},
    {name:"Startup India – Register",dept:"DPIIT",url:"https://startupindia.gov.in",desc:"DPIIT recognition, tax exemption, fund-of-funds, IPR support.",docs:["CIN/LLPIN","Business desc","Aadhaar of founder"]},
    {name:"PM Mudra – Apply Loan",dept:"MUDRA Bank",url:"https://mudra.org.in",desc:"Shishu ≤₹50K / Kishor ≤₹5L / Tarun ≤₹10L at nearest bank.",docs:["Business proof","Aadhaar","PAN","Bank statements","Project report"]},
    {name:"Stand Up India – Apply",dept:"SIDBI",url:"https://standupmitra.in",desc:"Greenfield enterprise loan for SC/ST/women entrepreneurs.",docs:["Aadhaar","SC/ST/gender cert","Business plan"]},
    {name:"PM SVANidhi – Vendor Loan",dept:"Ministry of Housing",url:"https://pmsvanidhi.mohua.gov.in",desc:"₹10K–₹50K collateral-free working capital for street vendors.",docs:["Vending cert","Aadhaar","Bank account","Photo"]},
    {name:"DDU-GKY Training",dept:"Ministry of Rural Development",url:"https://ddugky.gov.in",desc:"Free residential skill training with job placement for rural youth.",docs:["Aadhaar","Income cert","Education cert","BPL proof"]},
  ]},
  { cat:"💰 Finance & Tax", color:"#880e4f", items:[
    {name:"Income Tax e-Filing – File ITR",dept:"CBDT",url:"https://www.incometax.gov.in",desc:"File ITR 1–7, check refund, Form 26AS, AIS, instant e-PAN, Aadhaar-PAN link.",docs:["PAN","Aadhaar","Form 16","Bank statements","Investment proofs"]},
    {name:"GST – Register & File Returns",dept:"GSTN",url:"https://www.gst.gov.in",desc:"GST registration, GSTR-1/3B filing, e-invoicing, e-way bill.",docs:["PAN","Aadhaar","Business proof","Bank account","Office address"]},
    {name:"Jan Dhan – Open Account",dept:"Ministry of Finance",url:"https://pmjdy.gov.in",desc:"Zero-balance account at any bank with RuPay, ₹2L accident + ₹30K life insurance.",docs:["Aadhaar or Voter ID","One passport photo"]},
    {name:"EPFO – UAN, PF Balance & Claims",dept:"EPFO",url:"https://unifiedportal-mem.epfindia.gov.in",desc:"Activate UAN, check PF balance, file withdrawal/transfer, update KYC.",docs:["UAN","Aadhaar","PAN","Bank account"]},
    {name:"PMJJBY – Life Insurance Enroll",dept:"Ministry of Finance",url:"https://jansuraksha.gov.in",desc:"₹2L life cover at ₹436/year through your bank's net banking.",docs:["Bank account","Aadhaar","Age proof (18–50)"]},
    {name:"PMSBY – Accident Insurance Enroll",dept:"Ministry of Finance",url:"https://jansuraksha.gov.in",desc:"₹2L accident cover at ₹20/year auto-debited from savings account.",docs:["Bank account","Aadhaar","Age proof (18–70)"]},
    {name:"Atal Pension Yojana – Join",dept:"PFRDA",url:"https://npscra.nsdl.co.in",desc:"Guaranteed pension ₹1K–₹5K/month after 60 – join through bank.",docs:["Bank account","Aadhaar","Age proof (18–40)"]},
    {name:"Sukanya Samriddhi – Open Account",dept:"India Post / Banks",url:"https://www.indiapost.gov.in",desc:"7.6% tax-free interest for girl child at post office or authorised banks.",docs:["Girl birth cert","Parent Aadhaar & PAN","Photo"]},
  ]},
  { cat:"🏛️ Civic", color:"#00695c", items:[
    {name:"CPGRAMS – File Grievance",dept:"Dept of Administrative Reforms",url:"https://pgportal.gov.in",desc:"Lodge complaints against Central Govt ministries, track status.",docs:["Aadhaar or any ID","Complaint details"]},
    {name:"RTI – File Online",dept:"Ministry of Personnel",url:"https://rtionline.gov.in",desc:"Right to Information application to any Central Govt authority online.",docs:["₹10 fee (online)","Applicant ID"]},
    {name:"UMANG App – 1,200+ Services",dept:"MeitY / NeGD",url:"https://web.umang.gov.in",desc:"EPFO, ESIC, NPS, Aadhaar, Passport, CBSE, DigiLocker in one app.",docs:["Aadhaar for login"]},
    {name:"Solar Rooftop – Subsidy Apply",dept:"MNRE",url:"https://solarrooftop.gov.in",desc:"20–40% central subsidy on rooftop solar installation.",docs:["Electricity bill","Aadhaar","Property proof","Bank account"]},
    {name:"PM India – Official PMO Portal",dept:"PMO",url:"https://pmindia.gov.in",desc:"Official PM portal – schemes, speeches, contact PMO, public grievances.",docs:[]},
    {name:"India.gov.in – National Portal",dept:"NIC",url:"https://india.gov.in",desc:"Gateway to all central and state government websites and services.",docs:[]},
    {name:"myGov – Citizen Engagement",dept:"MyGov India",url:"https://mygov.in",desc:"Surveys, contests, share ideas on national policies directly.",docs:[]},
    {name:"Jal Jeevan Mission – Tap Water",dept:"Ministry of Jal Shakti",url:"https://jaljeevenmission.gov.in",desc:"Apply for household tap water connection under Har Ghar Jal.",docs:["Aadhaar","Address proof"]},
  ]},
];

const NEWS = [
  "🔔 PM Kisan 18th Installment released — Check status at pmkisan.gov.in",
  "📢 NSP Scholarships 2025-26 open — Apply at scholarships.gov.in before deadline",
  "✅ Ayushman Bharat expanded to all senior citizens above 70 — enroll today",
  "💼 PMKVY 4.0 free skill training open across India — register now",
  "🏠 PM Awas Yojana Urban 2.0 launched — apply at pmaymis.gov.in",
  "🌾 PM Fasal Bima Yojana enrollment open — insure your crops before sowing",
  "💰 Sukanya Samriddhi interest rate 7.6% — open account for your daughter today",
];
const LANGS=["English","हिंदी","தமிழ்","తెలుగు","ಕನ್ನಡ","বাংলা","मराठी","ગુજરાતી"];
const TC={Farmer:"#7c4b00",Student:"#1b5e20",Health:"#1565c0",Rural:"#4e342e",Women:"#880e4f",Employment:"#4527a0","Self-Employed":"#4527a0",Entrepreneur:"#283593",Financial:"#880e4f",Insurance:"#6a1b9a",Housing:"#00695c",Disability:"#37474f",Elderly:"#5d4037",BPL:"#b71c1c",Youth:"#4a148c",OBC:"#37474f",SC:"#1a237e",ST:"#1b5e20",Child:"#006064",Education:"#1b5e20",Digital:"#006064",Unorganised:"#546e7a",Urban:"#0d47a1"};

const BOT_GREETING = `Namaste! 🙏 I'm **Sahayak**, your AI government scheme assistant.\n\nI can help you with:\n• Which schemes you qualify for\n• How to apply for Aadhaar, PAN, Passport\n• Scholarship and education loans\n• Health schemes for your family\n• Farmer schemes and crop insurance\n\nJust type your question below!`;

const respond = q => {
  const l = q.toLowerCase();
  if(/pm kisan|kisan samman/.test(l)) return "**PM Kisan Samman Nidhi**\n\n💰 Benefit: ₹6,000/year (₹2,000 × 3 instalments)\n✅ Eligibility: Farmer with cultivable land, income < ₹2 lakh\n📋 Documents: Aadhaar, land records, bank passbook\n🔗 Apply at: **pmkisan.gov.in**\n\nSteps:\n1. Visit pmkisan.gov.in\n2. Click 'New Farmer Registration'\n3. Enter Aadhaar number\n4. Fill land and bank details\n5. Submit and track status";
  if(/scholarship|student|education/.test(l)) return "**Scholarships Available:**\n\n1. NSP – All students, up to ₹50K/year → scholarships.gov.in\n2. PM YASASVI – OBC students, ₹1.25L/year → nta.ac.in\n3. AICTE Pragati – Girl students in technical college → aicte-india.org\n4. AICTE Saksham – Disabled students → aicte-india.org\n5. SC Post-Matric – Full fee waiver → scholarships.gov.in\n6. Vidya Lakshmi – Education loans from 38 banks → vidyalakshmi.co.in\n\nWhich scholarship are you looking for?";
  if(/ayushman|health|pmjay|hospital/.test(l)) return "**Ayushman Bharat PM-JAY**\n\n💰 Benefit: ₹5 lakh/family/year free health cover\n✅ Eligibility: SECC 2011 listed family (BPL)\n🏥 Coverage: 27,000+ empanelled hospitals\n🔗 Check eligibility: **pmjay.gov.in**\n\nOther health schemes:\n• Jan Aushadhi – 90% cheaper generic medicines\n• ESIC – for salaried employees ≤ ₹21K/month\n• ABHA Health ID – digital health records\n\nCall helpline: **14555** (free)";
  if(/aadhaar|aadhar/.test(l)) return "**Aadhaar Services at uidai.gov.in:**\n\n🆕 Apply new Aadhaar → visit nearest enrolment centre\n📝 Update address/mobile online → uidai.gov.in\n📥 Download e-Aadhaar → free PDF download\n🔒 Lock/unlock biometrics → online\n\n📞 Aadhaar helpline: **1947** (free, 24/7)\n\nTo find nearest enrolment centre:\n→ Go to uidai.gov.in → Locate Enrolment Centre → Enter pincode";
  if(/pan card|pan number/.test(l)) return "**PAN Card at incometax.gov.in:**\n\n⚡ Instant e-PAN (Free, Aadhaar-based) → 10 minutes\n📝 Apply via NSDL/UTIITSL → ₹107 fee\n🔗 Link PAN with Aadhaar → mandatory, ₹1,000 fee\n📥 Download e-PAN → free\n\nFor instant e-PAN:\n1. Go to incometax.gov.in\n2. Click 'Instant e-PAN'\n3. Enter Aadhaar number\n4. OTP verification\n5. e-PAN issued in minutes!";
  if(/passport/.test(l)) return "**Passport at passportindia.gov.in:**\n\n📋 Fresh passport: ₹1,500 (36 pages) / ₹2,000 (60 pages)\n⚡ Tatkal: ₹3,500 extra, faster processing\n📅 Book PSK appointment online\n📦 Delivery in 7–30 days\n\nDocuments needed:\n• Aadhaar card\n• DOB proof (birth certificate/school certificate)\n• Address proof\n• Old passport (for reissue)\n\n📞 Passport helpline: **1800-258-1800** (free)";
  if(/mudra|loan|business/.test(l)) return "**PM Mudra Yojana (Small Business Loans):**\n\n💼 Shishu: Up to ₹50,000 (startup)\n💼 Kishor: ₹50,001 to ₹5 lakh (growing)\n💼 Tarun: ₹5 lakh to ₹10 lakh (established)\n\n✅ No collateral required!\n🔗 Apply at: **mudra.org.in** or nearest bank/MFI\n\nDocuments needed:\n• Business proof\n• Aadhaar & PAN\n• 6-month bank statements\n• Project report";
  if(/pension|elderly|old age|vaya/.test(l)) return "**Pension Schemes:**\n\n👴 Atal Pension Yojana: ₹1K–₹5K/month (join age 18–40) → npscra.nsdl.co.in\n🏦 PM Vaya Vandana: 7.4% return for 60+ → licindia.in\n💰 Indira Gandhi Pension: ₹200–500/month for BPL elderly → nsap.nic.in\n👨‍🌾 PM Kisan Maan Dhan: ₹3,000/month for farmers 60+ → pmkmy.gov.in\n\nWhat is your age? I can suggest the best option!";
  if(/bpl|ration card|below poverty/.test(l)) return "**BPL Family Schemes:**\n\n🏥 Ayushman Bharat – ₹5L health cover → pmjay.gov.in\n🏠 PM Awas Yojana Gramin – free house → pmayg.nic.in\n🌾 PM Kisan – ₹6K/year (if farmer) → pmkisan.gov.in\n🍳 PM Ujjwala – free LPG connection → pmuy.gov.in\n💳 Jan Dhan – zero balance bank account → pmjdy.gov.in\n📞 NSAP Pension – monthly pension for elderly\n🔧 MGNREGA – 100 days work guarantee\n\n📋 Get your SECC/BPL status checked at your local Panchayat office.";
  if(/women|mahila|girl/.test(l)) return "**Women's Schemes:**\n\n🤱 PM Matru Vandana – ₹5,000 maternity benefit\n🏥 Janani Suraksha – ₹1,400 for hospital delivery\n🎓 AICTE Pragati – ₹50K scholarship (technical)\n🏠 PM Ujjwala – free LPG connection\n💰 Sukanya Samriddhi – 7.6% interest for girl child\n🏢 Working Women Hostel – affordable city accommodation\n👩‍💼 Stand Up India – business loan for women\n🆘 One Stop Centre (Sakhi) – violence support\n\n📞 Women Helpline: **181** (free, 24/7)";
  if(/farmer|agriculture|crop|kisan/.test(l)) return "**Farmer Schemes:**\n\n💰 PM Kisan – ₹6,000/year income support\n🌱 PM Fasal Bima – full crop insurance\n💳 Kisan Credit Card – credit at 4% interest\n🌿 Soil Health Card – free soil testing\n💧 PM Krishi Sinchai – 55% irrigation subsidy\n🛒 eNAM – online crop trading\n👴 PM Kisan Maan Dhan – ₹3,000/month pension after 60\n🐄 National Livestock Mission – 50% subsidy on enterprise\n\n📞 Kisan Call Centre: **1800-180-1551** (free)";
  if(/skill|training|pmkvy|job/.test(l)) return "**Employment & Skill Schemes:**\n\n🎓 PMKVY 4.0 – Free skill training + ₹8,000 reward → pmkvyofficial.org\n💼 NCS Portal – Job search + career guidance → ncs.gov.in\n🔧 e-Shram – Unorganised worker registration + ₹2L insurance\n🏪 PM Mudra – Business loan ₹50K–₹10L\n🌾 MGNREGA – 100 days guaranteed work (rural)\n🚀 Startup India – Tax benefits + funding for startups\n\nWhat type of work/skill are you interested in?";
  if(/hello|hi|namaste|helo|hey/.test(l)) return BOT_GREETING;
  return `I understand you're asking about **"${q}"**.\n\nHere are some ways I can help:\n• Type **"farmer schemes"** for agriculture schemes\n• Type **"scholarship"** for education support\n• Type **"health"** for medical schemes\n• Type **"BPL"** for poverty support schemes\n• Type **"women"** for women-specific schemes\n• Type **"job"** for employment schemes\n\nOr use the **🎯 Eligibility** tab to find all schemes you personally qualify for!\n\n📞 For immediate help: **1800-111-555** (free, 24/7)`;
};

// ═══════════════════════════════════════════
// AUTH SYSTEM — persistent localStorage DB
// ═══════════════════════════════════════════

const DB_KEY = "onop_users_db";
const SESSION_KEY = "onop_session";

const getDB = () => {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || "{}"); }
  catch { return {}; }
};
const saveDB = db => localStorage.setItem(DB_KEY, JSON.stringify(db));
const getSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
};
const saveSession = u => localStorage.setItem(SESSION_KEY, JSON.stringify(u));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

const hashPass = async p => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(p + "onop_salt_2025"));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const validateEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePass = p => p.length >= 8;
const validatePhone = p => /^[6-9]\d{9}$/.test(p.replace(/\s/g, ""));

function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=form, 2=otp verification
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  const up = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const genOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const validateForm = () => {
    const e = {};
    if (mode === "register") {
      if (!form.name.trim() || form.name.trim().length < 2) e.name = "Full name must be at least 2 characters";
      if (!validatePhone(form.phone)) e.phone = "Enter valid 10-digit mobile number";
      if (!validatePass(form.password)) e.password = "Password must be at least 8 characters";
      if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    }
    if (!validateEmail(form.email)) e.email = "Enter a valid email address";
    if (mode === "login" && !form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const db = getDB();
    if (db[form.email.toLowerCase()]) {
      setErrors({ email: "This email is already registered. Please login." });
      setLoading(false);
      return;
    }
    const otp = genOtp();
    setGeneratedOtp(otp);
    setMsg(`OTP sent to ${form.email}: ${otp} (In real app, this would be sent via email)`);
    setStep(2);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (form.otp !== generatedOtp) {
      setErrors({ otp: "Incorrect OTP. Please try again." });
      return;
    }
    setLoading(true);
    const db = getDB();
    const hash = await hashPass(form.password);
    const user = {
      name: form.name.trim(),
      email: form.email.toLowerCase(),
      phone: form.phone,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      avatar: form.name.trim()[0].toUpperCase(),
      provider: "email",
      verified: true,
      savedSchemes: [],
      profile: {},
    };
    db[form.email.toLowerCase()] = user;
    saveDB(db);
    const session = { ...user, passwordHash: undefined };
    saveSession(session);
    setLoading(false);
    onSuccess(session);
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const db = getDB();
    const user = db[form.email.toLowerCase()];
    if (!user) {
      setErrors({ email: "No account found with this email. Please register." });
      setLoading(false);
      return;
    }
    const hash = await hashPass(form.password);
    if (hash !== user.passwordHash) {
      setErrors({ password: "Incorrect password. Please try again." });
      setLoading(false);
      return;
    }
    const session = { ...user, passwordHash: undefined };
    saveSession(session);
    setLoading(false);
    onSuccess(session);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const mockGoogleUser = {
        name: "Google User",
        email: "googleuser@gmail.com",
        phone: "",
        avatar: "G",
        provider: "google",
        verified: true,
        createdAt: new Date().toISOString(),
        savedSchemes: [],
        profile: {},
      };
      const db = getDB();
      if (!db[mockGoogleUser.email]) {
        db[mockGoogleUser.email] = { ...mockGoogleUser, passwordHash: null };
        saveDB(db);
      }
      saveSession(mockGoogleUser);
      setLoading(false);
      onSuccess(mockGoogleUser);
    }, 1200);
  };

  const handleForgot = () => {
    if (!validateEmail(form.email)) { setErrors({ email: "Enter a valid email address" }); return; }
    const db = getDB();
    if (!db[form.email.toLowerCase()]) { setErrors({ email: "No account found with this email." }); return; }
    const otp = genOtp();
    setGeneratedOtp(otp);
    setMsg(`Password reset OTP: ${otp} (In real app, sent to your email)`);
    setStep(2);
  };

  const handleResetPass = async () => {
    if (form.otp !== generatedOtp) { setErrors({ otp: "Incorrect OTP" }); return; }
    if (!validatePass(form.password)) { setErrors({ password: "Password must be at least 8 characters" }); return; }
    if (form.password !== form.confirm) { setErrors({ confirm: "Passwords do not match" }); return; }
    const db = getDB();
    const hash = await hashPass(form.password);
    db[form.email.toLowerCase()].passwordHash = hash;
    saveDB(db);
    setMsg("Password reset successfully! Please login.");
    setMode("login"); setStep(1); setForm(f => ({ ...f, password: "", confirm: "", otp: "" }));
  };

  const Inp = ({ label, k, type = "text", placeholder, icon }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 700, color: "#333", marginBottom: 6, fontSize: 13 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>
        <input
          type={type === "password" ? (showPass ? "text" : "password") : type}
          value={form[k]} onChange={e => up(k, e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "11px 13px 11px 38px",
            borderRadius: 10, border: `2px solid ${errors[k] ? "#e53935" : "#e0e4ec"}`,
            fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            transition: "border-color .2s",
          }}
          onFocus={e => { if (!errors[k]) e.target.style.borderColor = "#FF9933"; }}
          onBlur={e => { if (!errors[k]) e.target.style.borderColor = "#e0e4ec"; }}
          onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : step === 2 ? (mode === "register" ? handleVerifyOtp() : handleResetPass()) : mode === "register" ? handleRegister() : handleForgot())}
        />
        {type === "password" && (
          <span onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16, color: "#aaa" }}>
            {showPass ? "🙈" : "👁️"}
          </span>
        )}
      </div>
      {errors[k] && <div style={{ color: "#e53935", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>⚠️ {errors[k]}</div>}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fu" style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,.3)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0b1929,#162840)", padding: "24px 28px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ color: "#FF9933", fontSize: 9, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>🇮🇳 ONE NATION, ONE PORTAL</div>
              <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 20, fontFamily: "'Playfair Display',serif" }}>
                {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}
              </h2>
              <p style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 4 }}>
                {mode === "login" ? "Sign in to access your government scheme dashboard" : mode === "register" ? "Register to save schemes and track applications" : "We'll send a verification code to your email"}
              </p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          {/* Mode tabs */}
          {mode !== "forgot" && (
            <div style={{ display: "flex", gap: 0, marginTop: 20, background: "rgba(255,255,255,.08)", borderRadius: 10, padding: 3 }}>
              {[["login", "Login"], ["register", "Register"]].map(([m, l]) => (
                <button key={m} onClick={() => { setMode(m); setStep(1); setErrors({}); setMsg(""); }} style={{
                  flex: 1, padding: "8px", borderRadius: 8, border: "none",
                  background: mode === m ? "#FF9933" : "none",
                  color: mode === m ? "#fff" : "rgba(255,255,255,.6)",
                  fontWeight: 800, cursor: "pointer", fontSize: 13, fontFamily: "inherit", transition: "all .2s",
                }}>{l}</button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
          {msg && (
            <div style={{ background: "#f0fff4", border: "1.5px solid #c3e6cb", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12.5, color: "#1b5e20", fontWeight: 600, lineHeight: 1.6 }}>
              ✅ {msg}
            </div>
          )}

          {step === 1 && (
            <>
              {/* Google Button */}
              {(mode === "login" || mode === "register") && (
                <>
                  <button onClick={handleGoogleLogin} disabled={loading} style={{
                    width: "100%", padding: "12px", borderRadius: 10,
                    border: "2px solid #e0e4ec", background: loading ? "#f5f5f5" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    cursor: loading ? "default" : "pointer", fontFamily: "inherit", marginBottom: 16,
                    fontWeight: 700, fontSize: 14, color: "#333", transition: "all .2s",
                  }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = "#4285f4"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(66,133,244,.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0e4ec"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    {loading ? "Connecting..." : `Continue with Google`}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ flex: 1, height: 1, background: "#eee" }} />
                    <span style={{ color: "#bbb", fontSize: 12, fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: "#eee" }} />
                  </div>
                </>
              )}

              {mode === "register" && <Inp label="Full Name" k="name" placeholder="e.g. Thanishka Y K B" icon="👤" />}
              <Inp label="Email Address" k="email" type="email" placeholder="youremail@gmail.com" icon="📧" />
              {mode === "register" && <Inp label="Mobile Number" k="phone" placeholder="10-digit mobile (e.g. 9876543210)" icon="📱" />}
              {mode !== "forgot" && <Inp label="Password" k="password" type="password" placeholder={mode === "register" ? "Min 8 characters" : "Enter your password"} icon="🔒" />}
              {mode === "register" && <Inp label="Confirm Password" k="confirm" type="password" placeholder="Re-enter password" icon="🔒" />}

              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: -10, marginBottom: 16 }}>
                  <span onClick={() => { setMode("forgot"); setStep(1); setErrors({}); }} style={{ color: "#FF9933", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Forgot Password?</span>
                </div>
              )}

              <button onClick={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot} disabled={loading} style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none",
                background: loading ? "#ccc" : "linear-gradient(135deg,#FF9933,#e07b20)",
                color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading ? "default" : "pointer",
                fontFamily: "inherit", transition: "opacity .2s",
              }}>
                {loading ? "⏳ Please wait..." : mode === "login" ? "🔐 Login to My Account" : mode === "register" ? "✅ Create Account" : "📧 Send Reset OTP"}
              </button>

              {mode === "forgot" && (
                <button onClick={() => { setMode("login"); setStep(1); setMsg(""); }} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "2px solid #e0e4ec", background: "#fff", color: "#555", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 10 }}>← Back to Login</button>
              )}
            </>
          )}

          {step === 2 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📧</div>
                <h3 style={{ fontWeight: 800, color: "#0b1929", marginBottom: 4 }}>Verify Your Email</h3>
                <p style={{ color: "#888", fontSize: 13 }}>Enter the 6-digit OTP sent to <strong>{form.email}</strong></p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 700, color: "#333", marginBottom: 6, fontSize: 13 }}>6-Digit OTP</label>
                <input value={form.otp} onChange={e => up("otp", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit OTP" maxLength={6} style={{ width: "100%", padding: "14px", borderRadius: 10, border: `2px solid ${errors.otp ? "#e53935" : "#e0e4ec"}`, fontSize: 22, fontWeight: 800, textAlign: "center", letterSpacing: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#FF9933"} onBlur={e => { if (!errors.otp) e.target.style.borderColor = "#e0e4ec"; }} onKeyDown={e => e.key === "Enter" && (mode === "register" ? handleVerifyOtp() : handleResetPass())} />
                {errors.otp && <div style={{ color: "#e53935", fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>⚠️ {errors.otp}</div>}
              </div>
              {mode === "forgot" && (
                <>
                  <Inp label="New Password" k="password" type="password" placeholder="Min 8 characters" icon="🔒" />
                  <Inp label="Confirm New Password" k="confirm" type="password" placeholder="Re-enter new password" icon="🔒" />
                </>
              )}
              <button onClick={mode === "register" ? handleVerifyOtp : handleResetPass} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: loading ? "#ccc" : "linear-gradient(135deg,#138808,#0d5c07)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading ? "default" : "pointer", fontFamily: "inherit" }}>
                {loading ? "⏳ Verifying..." : mode === "register" ? "✅ Verify & Complete Registration" : "🔐 Reset Password"}
              </button>
              <button onClick={() => { setStep(1); setForm(f => ({ ...f, otp: "" })); setErrors({}); setMsg(""); }} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "2px solid #e0e4ec", background: "#fff", color: "#555", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 10 }}>← Go Back</button>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#bbb", lineHeight: 1.6 }}>
            🔒 Your data is encrypted and stored securely.<br />We never share your information with third parties.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("English");
  const [showLang, setShowLang] = useState(false);
  const [newsIdx, setNewsIdx] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ r: "bot", t: BOT_GREETING }]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(() => getSession());
  const chatEnd = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNewsIdx(i => (i + 1) % NEWS.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatEnd.current) chatEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs, chatOpen]);

  const sendMsg = () => {
    const q = inp.trim();
    if (!q) return;
    setInp("");
    setMsgs(m => [...m, { r: "user", t: q }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { r: "bot", t: respond(q) }]);
    }, 800);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setShowUserMenu(false);
  };

  const NAV = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "eligibility", icon: "🎯", label: "Eligibility" },
    { id: "schemes", icon: "📋", label: "All Schemes" },
    { id: "portals", icon: "🔗", label: "Apply Online" },
    { id: "help", icon: "🆘", label: "Help" },
  ];

  const renderMsg = txt =>
    txt.split("**").map((s, i) =>
      i % 2 === 1 ? <strong key={i}>{s}</strong> : <span key={i}>{s}</span>
    );

  return (
    <>
      <style>{STYLE}</style>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={u => { setUser(u); setShowAuth(false); }} />}
      <div style={{ minHeight: "100vh", background: "#eef1f6", fontFamily: "'Inter',sans-serif" }}>

        {/* NAV */}
        <nav style={{
          background: "linear-gradient(90deg,#0b1929 0%,#162840 100%)",
          height: 58, display: "flex", alignItems: "center",
          padding: "0 16px", position: "sticky", top: 0, zIndex: 9000,
          boxShadow: "0 2px 24px rgba(0,0,0,.5)", justifyContent: "space-between",
        }}>
          <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", flexShrink: 0 }}>
            <span style={{ fontSize: 24 }}>🇮🇳</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13.5, letterSpacing: .3 }}>One Nation, One Portal</div>
              <div style={{ color: "#FF9933", fontSize: 8, letterSpacing: 2, fontWeight: 700 }}>GOVT OF INDIA · SDG 10 · 9 · 16</div>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                background: page === n.id ? "rgba(255,153,51,.18)" : "none",
                border: "none", borderBottom: page === n.id ? "2px solid #FF9933" : "2px solid transparent",
                color: page === n.id ? "#FF9933" : "rgba(255,255,255,.72)",
                padding: "0 12px", height: 58, cursor: "pointer",
                fontWeight: 700, fontSize: 11.5, fontFamily: "inherit",
                transition: "all .2s", whiteSpace: "nowrap",
              }}>{n.icon} {n.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowLang(!showLang)} style={{
                background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)",
                borderRadius: 6, padding: "5px 11px", color: "#fff", cursor: "pointer",
                fontFamily: "inherit", fontSize: 11, fontWeight: 700,
              }}>🌐 {lang} ▾</button>
              {showLang && (
                <div style={{
                  position: "absolute", top: "110%", right: 0, background: "#fff",
                  borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,.25)",
                  overflow: "hidden", zIndex: 9999, minWidth: 145,
                }}>
                  {LANGS.map(l => (
                    <div key={l} onClick={() => { setLang(l); setShowLang(false); }} style={{
                      padding: "9px 14px", cursor: "pointer", fontSize: 13,
                      fontWeight: l === lang ? 800 : 500,
                      color: l === lang ? "#FF9933" : "#222",
                      background: l === lang ? "#fff8f0" : "#fff",
                    }}
                      onMouseEnter={e => { if (l !== lang) e.target.style.background = "#f5f5f5"; }}
                      onMouseLeave={e => { e.target.style.background = l === lang ? "#fff8f0" : "#fff"; }}
                    >{l}</div>
                  ))}
                </div>
              )}
            </div>

            {/* USER / LOGIN BUTTON */}
            {user ? (
              <div style={{ position: "relative" }}>
                <div onClick={() => setShowUserMenu(!showUserMenu)} style={{
                  display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                  background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 8, padding: "5px 12px",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg,#FF9933,#e07b20)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 900, fontSize: 13,
                  }}>{user.avatar || user.name?.[0]?.toUpperCase() || "U"}</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{user.name?.split(" ")[0] || "User"}</div>
                    <div style={{ color: "rgba(255,255,255,.5)", fontSize: 9 }}>{user.provider === "google" ? "Google" : "Email"} ✓</div>
                  </div>
                  <span style={{ color: "rgba(255,255,255,.5)", fontSize: 10 }}>▾</span>
                </div>
                {showUserMenu && (
                  <div style={{
                    position: "absolute", top: "110%", right: 0, background: "#fff",
                    borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,.25)",
                    overflow: "hidden", zIndex: 9999, minWidth: 220, border: "1px solid #f0f0f0",
                  }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0", background: "#fafbfc" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#FF9933,#e07b20)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16 }}>{user.avatar || user.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0b1929", fontSize: 14 }}>{user.name}</div>
                          <div style={{ color: "#888", fontSize: 11 }}>{user.email}</div>
                          {user.phone && <div style={{ color: "#888", fontSize: 11 }}>📱 {user.phone}</div>}
                        </div>
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                        <span style={{ background: user.verified ? "#e8f5e9" : "#fff3e0", color: user.verified ? "#1b5e20" : "#e65100", fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>{user.verified ? "✅ Verified" : "⚠️ Unverified"}</span>
                        <span style={{ background: "#e3f2fd", color: "#1565c0", fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>via {user.provider === "google" ? "Google" : "Email"}</span>
                      </div>
                    </div>
                    {[
                      { icon: "🎯", label: "Check Eligibility", action: () => { setPage("eligibility"); setShowUserMenu(false); } },
                      { icon: "📋", label: "Browse Schemes", action: () => { setPage("schemes"); setShowUserMenu(false); } },
                      { icon: "🔗", label: "Apply Online", action: () => { setPage("portals"); setShowUserMenu(false); } },
                      { icon: "🆘", label: "Help & Support", action: () => { setPage("help"); setShowUserMenu(false); } },
                    ].map(item => (
                      <div key={item.label} onClick={item.action} style={{ padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#333", borderBottom: "1px solid #f5f5f5" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8f9fa"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                      >
                        <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
                      </div>
                    ))}
                    <div onClick={handleLogout} style={{ padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700, color: "#e53935" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      <span style={{ fontSize: 16 }}>🚪</span>Sign Out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} style={{
                background: "linear-gradient(135deg,#FF9933,#e07b20)", border: "none",
                borderRadius: 6, padding: "7px 16px", color: "#fff",
                fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 11,
              }}>Login / Register</button>
            )}
          </div>
        </nav>

        {/* NEWS TICKER */}
        <div style={{ background: "#FF9933", padding: "7px 16px", display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <span style={{ background: "#0b1929", color: "#FF9933", fontSize: 8, fontWeight: 900, padding: "2px 8px", borderRadius: 3, letterSpacing: 1.5, whiteSpace: "nowrap" }}>LIVE</span>
          <div key={newsIdx} className="tk" style={{ color: "#0b1929", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>{NEWS[newsIdx]}</div>
        </div>

        {/* USER WELCOME BANNER */}
        {user && (
          <div style={{ background: "linear-gradient(90deg,#1b5e20,#2e7d32)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
              🙏 Namaste, <strong>{user.name?.split(" ")[0]}</strong>! Welcome to One Nation, One Portal.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPage("eligibility")} style={{ background: "#FF9933", border: "none", borderRadius: 6, padding: "6px 14px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>🎯 Check My Eligibility</button>
              <button onClick={() => setPage("schemes")} style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 6, padding: "6px 14px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>📋 Browse Schemes</button>
            </div>
          </div>
        )}

        {/* PAGE */}
        <div style={{ paddingBottom: 68 }}>
          {page === "home" && <HomePage setPage={setPage} />}
          {page === "eligibility" && <EligibilityPage setPage={setPage} />}
          {page === "schemes" && <SchemesPage />}
          {page === "portals" && <PortalsPage />}
          {page === "help" && <HelpPage />}
        </div>

        {/* MOBILE BOTTOM NAV */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0b1929", borderTop: "1px solid rgba(255,153,51,.3)", display: "flex", zIndex: 8000, padding: "3px 0" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ flex: 1, background: "none", border: "none", padding: "7px 0", color: page === n.id ? "#FF9933" : "rgba(255,255,255,.4)", cursor: "pointer", fontFamily: "inherit", fontSize: 8.5, fontWeight: 700, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 17 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>

        {/* CHAT FAB */}
        <div onClick={() => setChatOpen(o => !o)} className={!chatOpen ? "pulse" : ""} style={{ position: "fixed", bottom: 82, right: 16, zIndex: 9997, background: chatOpen ? "#0b1929" : "#25D366", borderRadius: "50%", width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,.35)", cursor: "pointer", fontSize: 22, transition: "background .3s" }}>{chatOpen ? "✕" : "💬"}</div>

        {/* CHAT WINDOW */}
        {chatOpen && (
          <div style={{ position: "fixed", bottom: 144, right: 16, zIndex: 9996, width: 320, background: "#fff", borderRadius: 16, boxShadow: "0 12px 48px rgba(0,0,0,.28)", display: "flex", flexDirection: "column", overflow: "hidden", border: "2px solid #FF9933", maxHeight: 460 }}>
            <div style={{ background: "linear-gradient(135deg,#0b1929,#162840)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FF9933", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Sahayak – AI Assistant</div>
                <div style={{ color: "#4caf50", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50", display: "inline-block" }} />
                  Online · Replies instantly
                </div>
              </div>
              {user && <div style={{ marginLeft: "auto", color: "rgba(255,255,255,.5)", fontSize: 10 }}>Hi, {user.name?.split(" ")[0]}!</div>}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10, background: "#f7f9fb" }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.r === "user" ? "flex-end" : "flex-start", maxWidth: "86%", background: m.r === "user" ? "linear-gradient(135deg,#FF9933,#e07b20)" : "#fff", color: m.r === "user" ? "#fff" : "#222", padding: "10px 13px", fontSize: 12.5, lineHeight: 1.65, borderRadius: m.r === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", boxShadow: "0 2px 8px rgba(0,0,0,.08)", whiteSpace: "pre-line" }}>{renderMsg(m.t)}</div>
              ))}
              {typing && (
                <div style={{ alignSelf: "flex-start", background: "#fff", padding: "10px 14px", borderRadius: "14px 14px 14px 3px", boxShadow: "0 2px 8px rgba(0,0,0,.08)", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF9933", display: "inline-block", opacity: 0.6, animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ padding: "6px 10px", background: "#f0f2f5", display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["PM Kisan", "Scholarship", "Health schemes", "BPL schemes", "Women schemes"].map(q => (
                <button key={q} onClick={() => { setInp(q); }} style={{ background: "#fff", border: "1px solid #FF9933", color: "#e07b20", borderRadius: 12, padding: "4px 9px", fontSize: 10, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>{q}</button>
              ))}
            </div>
            <div style={{ display: "flex", padding: 10, gap: 8, background: "#fff", borderTop: "1px solid #eee" }}>
              <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Ask about any scheme..." style={{ flex: 1, padding: "9px 13px", borderRadius: 20, border: "1.5px solid #ddd", fontSize: 12.5, outline: "none", fontFamily: "inherit" }} onFocus={e => e.target.style.borderColor = "#FF9933"} onBlur={e => e.target.style.borderColor = "#ddd"} />
              <button onClick={sendMsg} style={{ background: "linear-gradient(135deg,#FF9933,#e07b20)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function HomePage({ setPage }) {
  const CATS = [
    { icon: "🪪", t: "Identity & Documents", s: "Aadhaar · PAN · Passport · Voter ID", c: "#c0392b", p: "portals" },
    { icon: "🏥", t: "Health & Medical", s: "Ayushman · ESIC · ABHA", c: "#1565c0", p: "schemes" },
    { icon: "🎓", t: "Education & Scholarships", s: "NSP · YASASVI · AICTE", c: "#1b5e20", p: "schemes" },
    { icon: "🌾", t: "Agriculture & Rural", s: "PM Kisan · Fasal Bima · KCC", c: "#e65100", p: "schemes" },
    { icon: "💼", t: "Employment & Skills", s: "PMKVY · Mudra · e-Shram", c: "#4527a0", p: "schemes" },
    { icon: "💰", t: "Financial Services", s: "ITR · GST · Jan Dhan · EPFO", c: "#880e4f", p: "portals" },
    { icon: "🏠", t: "Housing & Utilities", s: "PM Awas · Ujjwala · Solar", c: "#00695c", p: "schemes" },
    { icon: "🔗", t: "All Official Portals", s: "80+ direct apply links", c: "#37474f", p: "portals" },
  ];
  const [hov, setHov] = useState(null);
  const [sq, setSq] = useState("");
  return (
    <div>
      <div style={{ background: "linear-gradient(155deg,#071020 0%,#0d1f38 50%,#0a2b1a 100%)", padding: "60px 20px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,153,51,.1) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(19,136,8,.09) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-block", background: "rgba(255,153,51,.12)", border: "1px solid rgba(255,153,51,.35)", borderRadius: 30, padding: "5px 18px", marginBottom: 18, fontSize: 10.5, color: "#FF9933", fontWeight: 700, letterSpacing: 2 }}>🇮🇳 GOVERNMENT OF INDIA · SDG 10 · 9 · 16</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,5vw,54px)", fontWeight: 900, lineHeight: 1.08, background: "linear-gradient(135deg,#fff 15%,#FF9933 55%,#5dd96e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 14 }}>One Nation, One Portal</h1>
        <p style={{ color: "rgba(255,255,255,.58)", fontSize: 16, maxWidth: 520, margin: "0 auto 36px" }}>Every government scheme, every official portal — one trusted gateway for 1.4 billion Indians.</p>
        <div style={{ maxWidth: 560, margin: "0 auto 20px", display: "flex", background: "rgba(255,255,255,.09)", border: "2px solid rgba(255,255,255,.18)", borderRadius: 50, padding: "4px 4px 4px 22px" }}>
          <span style={{ fontSize: 16, marginRight: 8, color: "rgba(255,255,255,.6)" }}>🔍</span>
          <input value={sq} onChange={e => setSq(e.target.value)} placeholder="Search schemes, portals or services..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit" }} />
          <button onClick={() => setPage("schemes")} style={{ background: "linear-gradient(135deg,#FF9933,#e07b20)", border: "none", borderRadius: 40, padding: "10px 24px", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Search</button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap", marginTop: 36 }}>
          {[["60+", "Schemes"], ["80+", "Portals"], ["8", "Languages"], ["1.4B", "Citizens"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#FF9933" }}>{n}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: 2 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#eef1f6", padding: "48px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#0b1929", marginBottom: 6 }}>Explore All Services</h2>
          <p style={{ color: "#778", fontSize: 13 }}>Tap any category to browse schemes and apply directly</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14, maxWidth: 1000, margin: "0 auto" }}>
          {CATS.map((c, i) => (
            <div key={i} onClick={() => setPage(c.p)} style={{ background: "#fff", borderRadius: 14, padding: 22, cursor: "pointer", border: `2px solid ${hov === i ? c.c : "transparent"}`, boxShadow: hov === i ? `0 8px 28px ${c.c}22` : "0 2px 10px rgba(0,0,0,.06)", transform: hov === i ? "translateY(-3px)" : "none", transition: "all .25s" }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, color: "#0b1929", fontSize: 14.5, marginBottom: 4 }}>{c.t}</div>
              <div style={{ color: "#999", fontSize: 11, marginBottom: 14 }}>{c.s}</div>
              <div style={{ color: c.c, fontWeight: 700, fontSize: 12 }}>Explore →</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "linear-gradient(135deg,#1b5e20,#0d3d0d)", padding: "52px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Don't know which schemes you qualify for?</h2>
        <p style={{ color: "rgba(255,255,255,.78)", fontSize: 14.5, maxWidth: 480, margin: "0 auto 28px" }}>Answer 5 quick questions and instantly discover all schemes you're eligible for.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setPage("eligibility")} style={{ background: "#FF9933", border: "none", borderRadius: 50, padding: "14px 36px", color: "#fff", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Check My Eligibility →</button>
          <button onClick={() => setPage("schemes")} style={{ background: "rgba(255,255,255,.12)", border: "2px solid rgba(255,255,255,.3)", borderRadius: 50, padding: "14px 30px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Browse All 60 Schemes</button>
        </div>
      </div>
      <div style={{ background: "#0b1929", padding: "36px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 44, flexWrap: "wrap", maxWidth: 900, margin: "0 auto" }}>
          {[["🔒", "100% Verified", "Only .gov.in official links"], ["🌐", "8 Languages", "All Indian scripts"], ["📱", "Mobile-First", "Works on any device"], ["♿", "Accessible", "WCAG 2.1 AA"], ["💬", "AI Chat Help", "Sahayak assistant"], ["🆘", "Free Helpline", "1800-111-555"]].map(([ic, t, d]) => (
            <div key={t} style={{ textAlign: "center", maxWidth: 130 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{ic}</div>
              <div style={{ color: "#FF9933", fontWeight: 800, fontSize: 11.5, marginBottom: 3 }}>{t}</div>
              <div style={{ color: "rgba(255,255,255,.38)", fontSize: 10.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#060d18", padding: "22px 20px 80px", textAlign: "center" }}>
        <div style={{ color: "#FF9933", fontWeight: 700, marginBottom: 8, fontSize: 13.5 }}>📞 Toll-Free Helpline: 1800-111-555 (24/7 · All languages · Free)</div>
        <div style={{ color: "rgba(255,255,255,.3)", fontSize: 11 }}>© 2025 One Nation, One Portal · Sairam SDG Ideathon 6.0 · All links verified · Built for 1.4 Billion Indians 🇮🇳</div>
      </div>
    </div>
  );
}

function EligibilityPage({ setPage }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ age: "", gender: "", income: 300000, bpl: "", area: "", state: "Tamil Nadu", category: "", occupation: "" });
  const up = (k, v) => setF(p => ({ ...p, [k]: v }));
  const STEPS = [{ t: "Personal Details", s: "Age and gender" }, { t: "Income & Status", s: "Annual income and BPL" }, { t: "Location", s: "State and area type" }, { t: "Occupation", s: "Your work type" }, { t: "Confirm", s: "Review and get results" }];
  const results = done ? SCHEMES.filter(s => {
    const age = Number(f.age) || 25;
    if (age < s.minAge || age > s.maxAge) return false;
    if (s.incLimit !== 999999 && f.income > s.incLimit) return false;
    if (s.gender === "female" && f.gender !== "female") return false;
    if (s.area === "rural" && f.area === "urban") return false;
    if (s.area === "urban" && f.area === "rural") return false;
    return true;
  }) : [];

  const SB = ({ label, opts, k, val }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontWeight: 700, color: "#333", marginBottom: 10, fontSize: 13.5 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map(o => (
          <button key={o.v} onClick={() => up(k, o.v)} style={{ padding: "9px 16px", borderRadius: 9, border: `2px solid ${val === o.v ? "#FF9933" : "#dde"}`, background: val === o.v ? "#fff8f0" : "#fff", color: val === o.v ? "#e07b20" : "#555", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", transition: "all .15s" }}>{o.l}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#eef1f6", minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 660, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#0b1929", marginBottom: 5 }}>🎯 Scheme Eligibility Checker</h2>
          <p style={{ color: "#778", fontSize: 13 }}>Answer {STEPS.length} questions · Find all schemes you qualify for · 100% free</p>
        </div>
        {!done && (
          <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, background: i < step ? "#138808" : i === step ? "#FF9933" : "#dde", color: i <= step ? "#fff" : "#aaa", flexShrink: 0 }}>{i < step ? "✓" : i + 1}</div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 3, background: i < step ? "#138808" : "#e0e0e0", margin: "0 2px" }} />}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, color: "#FF9933", fontWeight: 700, fontSize: 12 }}>Step {step + 1}/{STEPS.length}: {STEPS[step].t}</div>
          </div>
        )}
        {!done ? (
          <div style={{ background: "#fff", borderRadius: 18, padding: "32px 28px", boxShadow: "0 4px 28px rgba(0,0,0,.08)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0b1929", marginBottom: 4 }}>{STEPS[step].t}</h3>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 26 }}>{STEPS[step].s}</p>
            {step === 0 && (<div>
              <label style={{ display: "block", fontWeight: 700, color: "#333", marginBottom: 8, fontSize: 13.5 }}>Your Age</label>
              <input type="number" value={f.age} onChange={e => up("age", e.target.value)} placeholder="e.g. 28" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #e0e4ec", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 20 }} onFocus={e => e.target.style.borderColor = "#FF9933"} onBlur={e => e.target.style.borderColor = "#e0e4ec"} />
              <SB label="Gender" k="gender" val={f.gender} opts={[{ v: "male", l: "👨 Male" }, { v: "female", l: "👩 Female" }, { v: "other", l: "🧑 Other" }]} />
            </div>)}
            {step === 1 && (<div>
              <label style={{ display: "block", fontWeight: 700, color: "#333", marginBottom: 8, fontSize: 13.5 }}>Annual Family Income: <span style={{ color: "#FF9933" }}>₹{f.income >= 100000 ? (f.income / 100000).toFixed(1) + "L" : (f.income / 1000).toFixed(0) + "K"}</span></label>
              <input type="range" min={0} max={1800000} step={10000} value={f.income} onChange={e => up("income", Number(e.target.value))} style={{ width: "100%", accentColor: "#FF9933", marginBottom: 6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 11, marginBottom: 22 }}><span>₹0</span><span>₹5L</span><span>₹10L</span><span>₹18L+</span></div>
              <SB label="Do you have a BPL / Ration Card?" k="bpl" val={f.bpl} opts={[{ v: "yes", l: "✅ Yes" }, { v: "no", l: "❌ No" }]} />
            </div>)}
            {step === 2 && (<div>
              <SB label="Area Type" k="area" val={f.area} opts={[{ v: "rural", l: "🏡 Rural / Village" }, { v: "urban", l: "🏙️ Urban / City" }, { v: "semiurban", l: "🌆 Semi-Urban" }]} />
              <SB label="Social Category" k="category" val={f.category} opts={[{ v: "general", l: "General" }, { v: "obc", l: "OBC" }, { v: "sc", l: "SC" }, { v: "st", l: "ST" }, { v: "ews", l: "EWS" }]} />
              <label style={{ display: "block", fontWeight: 700, color: "#333", marginBottom: 8, fontSize: 13.5 }}>State / UT</label>
              <select value={f.state} onChange={e => up("state", e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px solid #e0e4ec", fontSize: 14, fontFamily: "inherit", background: "#fff", cursor: "pointer", outline: "none" }}>
                {["Tamil Nadu", "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Odisha", "Punjab", "Rajasthan", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>)}
            {step === 3 && <SB label="Your Occupation" k="occupation" val={f.occupation} opts={[{ v: "farmer", l: "🌾 Farmer" }, { v: "student", l: "🎓 Student" }, { v: "employed", l: "💼 Employed" }, { v: "selfemployed", l: "🏪 Self-Employed" }, { v: "unorganised", l: "🔧 Daily Wage / Unorganised" }, { v: "unemployed", l: "🔍 Unemployed" }, { v: "homemaker", l: "🏠 Homemaker" }]} />}
            {step === 4 && (
              <div>
                <div style={{ background: "#f8f9fb", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  {[["Age", f.age || "Not set"], ["Gender", f.gender || "Not set"], ["Income", `₹${f.income >= 100000 ? (f.income / 100000).toFixed(1) + "L" : (f.income / 1000).toFixed(0) + "K"}/year`], ["BPL Card", f.bpl === "yes" ? "Yes" : "No"], ["Area", f.area || "Not set"], ["State", f.state], ["Category", f.category || "Not set"], ["Occupation", f.occupation || "Not set"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eef" }}>
                      <span style={{ color: "#777", fontSize: 13 }}>{k}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, textTransform: "capitalize", color: "#0b1929" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#f0fff4", borderRadius: 10, padding: 14, border: "1.5px solid #c3e6cb" }}>
                  <div style={{ color: "#138808", fontWeight: 700, fontSize: 13 }}>✅ Ready to find your eligible schemes from all 60 central govt schemes!</div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 10 }}>
              <button onClick={() => step > 0 && setStep(s => s - 1)} disabled={step === 0} style={{ padding: "12px 22px", borderRadius: 10, border: "2px solid #e0e4ec", background: "#fff", color: step === 0 ? "#ccc" : "#444", fontWeight: 700, cursor: step === 0 ? "default" : "pointer", fontFamily: "inherit", fontSize: 13 }}>← Back</button>
              <button onClick={() => { if (step < STEPS.length - 1) setStep(s => s + 1); else setDone(true); }} style={{ padding: "12px 30px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#FF9933,#e07b20)", color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>{step < STEPS.length - 1 ? "Continue →" : "🎯 Find My Schemes"}</button>
            </div>
          </div>
        ) : (
          <div className="fu">
            <div style={{ background: "linear-gradient(135deg,#1b5e20,#0d3d0d)", borderRadius: 16, padding: 28, marginBottom: 20, textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, marginBottom: 5 }}>You qualify for {results.length} schemes!</h3>
              <p style={{ opacity: .85, fontSize: 13.5 }}>Based on your profile. Click Apply Now to go to the official government portal.</p>
            </div>
            {results.length === 0 && (
              <div style={{ background: "#fff", borderRadius: 14, padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                <div style={{ fontWeight: 700, color: "#333", marginBottom: 8 }}>No exact matches — try adjusting income or occupation</div>
                <button onClick={() => setPage("schemes")} style={{ background: "#FF9933", border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Browse All 60 Schemes →</button>
              </div>
            )}
            <div style={{ display: "grid", gap: 12 }}>
              {results.map((s, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)", border: "2px solid transparent", transition: "border-color .2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#138808"} onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5, alignItems: "center" }}>
                        <span style={{ fontWeight: 800, color: "#0b1929", fontSize: 14.5 }}>{s.name}</span>
                        {s.tags.slice(0, 2).map(t => <span key={t} style={{ background: TC[t] || "#888", color: "#fff", fontSize: 9, padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{t}</span>)}
                      </div>
                      <div style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>{s.min}</div>
                      <div style={{ color: "#138808", fontWeight: 800, fontSize: 13.5 }}>✅ {s.benefit}</div>
                      <div style={{ color: "#666", fontSize: 12, marginTop: 5, lineHeight: 1.6 }}>{s.desc}</div>
                      <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {s.elig.map(e => <span key={e} style={{ background: "#f0f9ff", border: "1px solid #bfdbfe", color: "#1e40af", fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>✓ {e}</span>)}
                      </div>
                    </div>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 18px", borderRadius: 10, background: "linear-gradient(135deg,#138808,#0d5c07)", color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>Apply Now 🔗</a>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setDone(false); setStep(0); }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px solid #FF9933", background: "#fff", color: "#e07b20", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginTop: 14, fontSize: 14 }}>← Start Over / Change Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SchemesPage() {
  const ALL_TAGS = ["All", "Farmer", "Student", "Health", "Rural", "Women", "Employment", "Financial", "Housing", "Disability", "Elderly", "BPL", "Youth", "SC", "ST", "OBC", "Child", "Education"];
  const [tag, setTag] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const filtered = SCHEMES.filter(s => {
    const tagOk = tag === "All" || s.tags.includes(tag);
    const searchOk = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.min.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return tagOk && searchOk;
  });
  return (
    <div style={{ background: "#eef1f6", minHeight: "100vh", padding: "28px 16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: "#0b1929", marginBottom: 3 }}>📋 All Government Schemes</h2>
          <p style={{ color: "#888", fontSize: 12.5, marginBottom: 14 }}>{SCHEMES.length} central government schemes · Click any scheme to expand · All official apply links included</p>
          <div style={{ display: "flex", background: "#f0f2f5", borderRadius: 10, padding: "9px 14px", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#aaa" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by scheme name, ministry or keyword..." style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13.5, fontFamily: "inherit" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>×</button>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {ALL_TAGS.map(t => (
            <button key={t} onClick={() => setTag(t)} style={{ padding: "6px 13px", borderRadius: 20, border: "2px solid", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", borderColor: tag === t ? (TC[t] || "#FF9933") : "#dde", background: tag === t ? (TC[t] || "#FF9933") : "#fff", color: tag === t ? "#fff" : "#555" }}>{t}</button>
          ))}
        </div>
        <div style={{ color: "#888", fontSize: 12, marginBottom: 14 }}>Showing <strong style={{ color: "#333" }}>{filtered.length}</strong> of <strong style={{ color: "#333" }}>{SCHEMES.length}</strong> schemes{tag !== "All" && <span> · filtered by <strong style={{ color: TC[tag] || "#FF9933" }}>{tag}</strong></span>}</div>
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map(s => (
            <div key={s.id} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.06)", border: "2px solid transparent", transition: "border-color .2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#FF9933"} onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
              <div style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5, alignItems: "center" }}>
                    <span style={{ fontWeight: 800, color: "#0b1929", fontSize: 14.5 }}>{s.name}</span>
                    {s.tags.slice(0, 3).map(t => <span key={t} style={{ background: TC[t] || "#888", color: "#fff", fontSize: 9, padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>{t}</span>)}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ color: "#888", fontSize: 12 }}>{s.min}</span>
                    <span style={{ color: "#138808", fontWeight: 800, fontSize: 12 }}>✅ {s.benefit}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <a href={s.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#FF9933,#e07b20)", color: "#fff", fontWeight: 800, fontSize: 11, textDecoration: "none" }}>Apply 🔗</a>
                  <span style={{ color: "#FF9933", fontSize: 16, fontWeight: 800 }}>{expanded === s.id ? "▲" : "▼"}</span>
                </div>
              </div>
              {expanded === s.id && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f0f0f4" }}>
                  <p style={{ color: "#555", fontSize: 13, lineHeight: 1.75, marginBottom: 16, paddingTop: 16 }}>{s.desc}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <div style={{ background: "#f8f9fb", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 800, color: "#0b1929", fontSize: 11, marginBottom: 8, letterSpacing: .5 }}>ELIGIBILITY</div>
                      {s.elig.map(e => <div key={e} style={{ color: "#444", fontSize: 12, marginBottom: 4 }}>✓ {e}</div>)}
                    </div>
                    <div style={{ background: "#f0fff4", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontWeight: 800, color: "#1b5e20", fontSize: 11, marginBottom: 8, letterSpacing: .5 }}>BENEFIT</div>
                      <div style={{ color: "#1b5e20", fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{s.benefit}</div>
                      {s.minAge > 0 && <div style={{ color: "#555", fontSize: 12 }}>Age: {s.minAge}–{s.maxAge} years</div>}
                      {s.incLimit < 999999 && <div style={{ color: "#555", fontSize: 12 }}>Income limit: ₹{(s.incLimit / 100000).toFixed(1)}L/year</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ padding: "11px 22px", borderRadius: 10, background: "linear-gradient(135deg,#138808,#0d5c07)", color: "#fff", fontWeight: 800, fontSize: 12.5, textDecoration: "none" }}>Apply Now at {s.link.replace("https://", "")} 🔗</a>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ padding: "11px 18px", borderRadius: 10, border: "2px solid #138808", background: "#fff", color: "#138808", fontWeight: 700, fontSize: 12.5, textDecoration: "none" }}>Official Website →</a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 14 }}><div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div><div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>No schemes found — try a different search or filter</div></div>}
      </div>
    </div>
  );
}

function PortalsPage() {
  const [activeCat, setActiveCat] = useState(PORTALS[0].cat);
  const [search, setSearch] = useState("");
  const cur = PORTALS.find(p => p.cat === activeCat) || PORTALS[0];
  const allRes = search ? PORTALS.flatMap(p => p.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.dept.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())).map(i => ({ ...i, cat: p.cat, color: p.color }))) : null;
  return (
    <div style={{ background: "#eef1f6", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg,#0b1929,#162840)", padding: "32px 20px 26px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 5 }}>🔗 Official Government Portals</h2>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginBottom: 20 }}>Direct links to verified official .gov.in portals. All links open the real government website.</p>
        <div style={{ maxWidth: 520, margin: "0 auto", background: "rgba(255,255,255,.1)", border: "2px solid rgba(255,255,255,.2)", borderRadius: 50, display: "flex", alignItems: "center", padding: "6px 6px 6px 20px" }}>
          <span style={{ marginRight: 8, color: "rgba(255,255,255,.6)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search portals, services or departments..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13.5, fontFamily: "inherit" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 30, padding: "5px 12px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>✕</button>}
        </div>
      </div>
      {!search ? (
        <div style={{ display: "flex", minHeight: "calc(100vh - 200px)" }}>
          <div style={{ width: 190, background: "#fff", borderRight: "1px solid #e5e9f0", flexShrink: 0, paddingTop: 6, overflowY: "auto" }}>
            {PORTALS.map(p => (
              <div key={p.cat} onClick={() => setActiveCat(p.cat)} style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, background: activeCat === p.cat ? `${p.color}14` : "#fff", borderLeft: activeCat === p.cat ? `3px solid ${p.color}` : "3px solid transparent", transition: "all .2s" }}>
                <span style={{ fontSize: 16 }}>{p.cat.split(" ")[0]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: activeCat === p.cat ? p.color : "#333" }}>{p.cat.substring(p.cat.indexOf(" ") + 1)}</div>
                  <div style={{ fontSize: 10, color: "#bbb" }}>{p.items.length} portals</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "22px 20px", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 26 }}>{cur.cat.split(" ")[0]}</span>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#0b1929" }}>{cur.cat.substring(cur.cat.indexOf(" ") + 1)}</h3>
                <p style={{ color: "#888", fontSize: 11.5 }}>{cur.items.length} official portals · All verified</p>
              </div>
            </div>
            <div style={{ display: "grid", gap: 13 }}>
              {cur.items.map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", border: "2px solid transparent", transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = cur.color; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = ""; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: "#0b1929", fontSize: 14.5, marginBottom: 5 }}>{item.name}</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ background: `${cur.color}18`, color: cur.color, fontSize: 10, padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>{item.dept}</span>
                        <span style={{ color: "#bbb", fontSize: 10.5 }}>🔗 {item.url.replace("https://", "")}</span>
                      </div>
                      <p style={{ color: "#666", fontSize: 12.5, lineHeight: 1.65, marginBottom: item.docs.length > 0 ? 12 : 0 }}>{item.desc}</p>
                      {item.docs.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10.5, fontWeight: 800, color: "#aaa", marginBottom: 6, letterSpacing: .5 }}>DOCUMENTS REQUIRED:</div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {item.docs.map(d => <span key={d} style={{ background: "#fef9ec", border: "1px solid #fde68a", color: "#92400e", fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>📄 {d}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 18px", borderRadius: 10, border: "none", flexShrink: 0, background: `linear-gradient(135deg,${cur.color},${cur.color}cc)`, color: "#fff", fontWeight: 800, fontSize: 12.5, textDecoration: "none", whiteSpace: "nowrap" }}>Open Portal 🔗</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "22px 20px", maxWidth: 920, margin: "0 auto" }}>
          <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Found <strong style={{ color: "#333" }}>{allRes.length}</strong> results for "{search}"</div>
          <div style={{ display: "grid", gap: 12 }}>
            {allRes.map((item, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,.06)", border: `2px solid ${item.color}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: item.color, fontWeight: 700, marginBottom: 4 }}>{item.cat.toUpperCase()}</div>
                    <div style={{ fontWeight: 800, color: "#0b1929", fontSize: 14.5, marginBottom: 6 }}>{item.name}</div>
                    <p style={{ color: "#666", fontSize: 12.5 }}>{item.desc}</p>
                  </div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 16px", borderRadius: 10, background: item.color, color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Open 🔗</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ background: "#0b1929", padding: "18px 20px", textAlign: "center" }}>
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>🔒 All links verified official Government of India portals · This portal does not store personal data · Always verify URL ends with .gov.in</div>
      </div>
    </div>
  );
}

function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const FAQS = [
    ["How do I update my Aadhaar address online?", "Visit uidai.gov.in → 'Update Aadhaar' → Enter 12-digit Aadhaar → Select Address Update → Upload valid address proof → Pay ₹50 online → Note URN for tracking. Update reflects in 30–90 days."],
    ["How to check Ayushman Bharat eligibility?", "Visit pmjay.gov.in → 'Am I Eligible' → Enter mobile or ration card number. If your family is in SECC 2011 database, you get ₹5 lakh/year health cover at 27,000+ hospitals. Call 14555 for help."],
    ["How to apply for PM Kisan?", "Visit pmkisan.gov.in → 'New Farmer Registration' → Enter Aadhaar → Fill land details → Submit. State verifies and approves. After approval, ₹2,000 credited every 4 months directly to bank account."],
    ["Documents needed for National Scholarship?", "Aadhaar card, bank passbook (Aadhaar-linked), last marksheet with min 50% marks, income certificate from SDM/Tehsildar, caste certificate (if applicable), college enrollment letter. Apply at scholarships.gov.in."],
    ["How to open Jan Dhan zero-balance account?", "Visit any bank or post office with Aadhaar + 1 passport photo. Account opens same day with free RuPay debit card, ₹2L accidental insurance, and ₹30K life insurance."],
    ["How to register on e-Shram portal?", "Visit eshram.gov.in → 'Register on e-Shram' → Enter Aadhaar-linked mobile OTP → Fill occupation details → Submit. Get UAN card with ₹2L PMSBY accident insurance instantly. Free, takes 5 minutes."],
    ["What is PM Mudra Yojana?", "PM Mudra provides collateral-free business loans: Shishu (≤₹50K), Kishor (₹50K–₹5L), Tarun (₹5L–₹10L). Visit mudra.org.in or apply at nearest bank/MFI with Aadhaar, PAN, bank statements, project report."],
    ["How to find nearest CSC?", "Visit locator.csccloud.in → Enter pincode → Find nearest CSC. CSCs provide Aadhaar, PAN, Passport, Scholarship, PM Kisan, Birth/Income/Caste certificates, Insurance services at ₹30–₹100 fee."],
    ["How to link PAN with Aadhaar?", "Visit incometax.gov.in → Login → 'Link Aadhaar' in Quick Links → Enter PAN and Aadhaar → Pay ₹1,000 via Challan 280 → Submit. Or SMS: UIDPAN<space>Aadhaar<space>PAN to 567678."],
    ["How to apply for MGNREGA job card?", "Visit your Gram Panchayat or BDO office → Submit application with name, age, Aadhaar, bank details, address → Job card issued in 15 days → Then demand work → Work allocated in 15 days → Payment in 15 days."],
  ];
  return (
    <div style={{ background: "#eef1f6", minHeight: "100vh", padding: "28px 16px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#0b1929", marginBottom: 4 }}>🆘 Help & Support Centre</h2>
          <p style={{ color: "#888", fontSize: 13 }}>Guides, helplines and FAQs to help you access all government services.</p>
        </div>
        <div style={{ background: "linear-gradient(135deg,#FF9933,#e07b20)", borderRadius: 18, padding: 28, marginBottom: 18, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 18 }}>
            <div>
              <div style={{ fontSize: 30, marginBottom: 6 }}>📞</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Toll-Free Helpline</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 2, marginBottom: 4 }}>1800-111-555</div>
              <div style={{ opacity: .9, fontSize: 13 }}>24/7 · Free from any phone · All 8 languages</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
              <button style={{ background: "#fff", color: "#e07b20", border: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>📞 Call Now</button>
              <button style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: "2px solid rgba(255,255,255,.4)", padding: "12px 24px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>💬 WhatsApp Help</button>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 13, marginBottom: 18 }}>
          {[{ ic: "📍", t: "Find CSC Near You", s: "Common Service Centres", url: "https://locator.csccloud.in", c: "#1b5e20" }, { ic: "📝", t: "File RTI Online", s: "Right to Information", url: "https://rtionline.gov.in", c: "#1565c0" }, { ic: "😤", t: "File Grievance", s: "CPGRAMS Portal", url: "https://pgportal.gov.in", c: "#4527a0" }, { ic: "📱", t: "UMANG App", s: "1,200+ Gov Services", url: "https://web.umang.gov.in", c: "#e25822" }].map(c => (
            <a key={c.t} href={c.url} target="_blank" rel="noopener noreferrer" style={{ background: "#fff", borderRadius: 14, padding: 18, textDecoration: "none", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 10px rgba(0,0,0,.06)", border: "2px solid transparent", transition: "border-color .2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = c.c} onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
              <span style={{ fontSize: 26 }}>{c.ic}</span>
              <div><div style={{ fontWeight: 800, color: "#0b1929", fontSize: 13.5 }}>{c.t}</div><div style={{ color: "#aaa", fontSize: 11 }}>{c.s}</div></div>
            </a>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 18, boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 900, color: "#0b1929", marginBottom: 14 }}>📍 Find Nearest Help Centre</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input placeholder="Enter your 6-digit Pincode (e.g. 600089)" style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "2px solid #e0e4ec", fontSize: 13.5, outline: "none", fontFamily: "inherit" }} onFocus={e => e.target.style.borderColor = "#FF9933"} onBlur={e => e.target.style.borderColor = "#e0e4ec"} />
            <button style={{ padding: "11px 20px", borderRadius: 10, border: "none", background: "#138808", color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Search</button>
          </div>
          <div style={{ padding: 16, background: "#f0fff4", borderRadius: 12, border: "1.5px solid #c3e6cb" }}>
            <div style={{ fontWeight: 800, color: "#0b1929", fontSize: 14, marginBottom: 3 }}>🏢 Nandambakkam Common Service Centre</div>
            <div style={{ color: "#555", fontSize: 12.5, marginBottom: 4 }}>123 GST Road, Nandambakkam, Chennai – 600089 · 0.8 km away</div>
            <div style={{ color: "#138808", fontWeight: 700, fontSize: 12 }}>⏰ Mon–Sat 9AM–6PM · 📞 +91 99999 12345</div>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 18, boxShadow: "0 2px 10px rgba(0,0,0,.06)" }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#0b1929", marginBottom: 20 }}>💬 Frequently Asked Questions</h3>
          {FAQS.map(([q, a], i) => (
            <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid #f0f2f5" : "none", marginBottom: 14, paddingBottom: 14 }}>
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", cursor: "pointer", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontWeight: 700, color: "#0b1929", fontSize: 13.5, flex: 1, lineHeight: 1.5 }}>{q}</span>
                <span style={{ color: "#FF9933", fontSize: 20, fontWeight: 800, flexShrink: 0, display: "inline-block", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
              </div>
              {openFaq === i && <p style={{ color: "#555", fontSize: 13, lineHeight: 1.8, marginTop: 10 }}>{a}</p>}
            </div>
          ))}
        </div>
        <div style={{ background: "#0b1929", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#FF9933", fontWeight: 900, fontSize: 17, marginBottom: 18 }}>📞 Important Government Helplines</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 10 }}>
            {[["Kisan Call Centre", "1800-180-1551"], ["PM Kisan Helpline", "155261"], ["Aadhaar Helpline", "1947"], ["Passport Seva", "1800-258-1800"], ["Income Tax", "1800-103-0025"], ["EPFO Helpline", "1800-118-005"], ["NCS Portal", "1800-425-1514"], ["Ayushman Bharat", "14555"], ["ESIC Helpline", "1800-11-2526"], ["GST Helpdesk", "1800-103-4786"], ["Child Helpline", "1098"], ["Women Helpline", "181"], ["Senior Citizen", "14567"], ["Disability Help", "1800-111-777"], ["Scholarship NSP", "0120-6619540"], ["PMKVY Help", "1800-123-9626"]].map(([name, num]) => (
              <div key={name} style={{ background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, marginBottom: 4 }}>{name}</div>
                <div style={{ color: "#FF9933", fontWeight: 900, fontSize: 14.5 }}>📞 {num}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
