export interface RagEntry {
  id: string;
  triggerPhrase: string;
  responseType: 'text' | 'image' | 'video' | 'audio';
  responseText: string;
  mediaUrl?: string; // Optional URL for image, video, or audio
  audioDuration?: string; // If audio, mock duration e.g. "0:15"
}

// Initial knowledge base built from the user's provided website context.
export const initialRagKnowledge: RagEntry[] = [
  {
    id: "1",
    triggerPhrase: "ola",
    responseType: "text",
    responseText: "Olá! Seja muito bem vindo à KAVI Art Clinic. Como posso ajudar com o seu sorriso hoje? \n\nNós realizamos tratamentos como:\n- Facetas Dentárias\n- Implantologia (All-on-4)\n- Harmonização Orofacial\n- Alinhadores e Branqueamento."
  },
  {
    id: "2",
    triggerPhrase: "tudo bem",
    responseType: "text",
    responseText: "Tudo ótimo! Aqui é a Atendente Virtual da KAVI Art Clinic, a tua clínica de Medicina Dentária e Harmonização Orofacial no Porto, Portugal.\n\nGostaria de saber mais sobre algum tratamento ou agendar uma avaliação?"
  },
  {
    id: "3",
    triggerPhrase: "marcar consulta",
    responseType: "text",
    responseText: "Excelente! Para marcar uma Consulta de Avaliação, por favor informe o seu Nome e Telefone, ou se preferir, ligue diretamente para +351 912 092 209."
  },
  {
    id: "4",
    triggerPhrase: "telefone",
    responseType: "text",
    responseText: "O nosso telefone principal para contacto e marcações é +351 912 092 209. O nosso telefone de emergência é 963 086 963."
  },
  {
    id: "5",
    triggerPhrase: "onde ficam",
    responseType: "text",
    responseText: "Nossa clínica fica localizada no coração do Porto, Portugal. O endereço exato é:\nRua Arquitecto Marques da Silva, 285 - Porto."
  },
  {
    id: "6",
    triggerPhrase: "horario",
    responseType: "text",
    responseText: "O nosso horário de atendimento é de Segunda a Sexta das 09:00 - 19:00 e aos Sábados das 09:00 - 13:00. Aos domingos estamos encerrados."
  },
  {
    id: "7",
    triggerPhrase: "quem sao as medicas",
    responseType: "text",
    responseText: "O nosso corpo clínico de excelência conta com a Dra. Kátia Fragoso (Diretora Clínica e Especialista em Reabilitação Oral) e a Dra. Victória Berenice (Especialista em Harmonização Orofacial e Estética Regenerativa)."
  },
  {
    id: "8",
    triggerPhrase: "facetas",
    responseType: "image",
    responseText: "As Facetas Dentárias são 'lentes' ultrafinas personalizadas para corrigir pequenas imperfeições, manchas ou espaços em seus dentes. Oferecemos opções em Cerâmica (Premium/Porcelana, durabilidade e brilho inalteráveis) e em Resina Composta (Mais rápido e acessível). Quer agendar um design de sorriso?",
    mediaUrl: "https://www.midlandsderm.com/wp-content/uploads/2019/04/Botox-Fillers-Dermatology-1024x580.jpg"
  },
  {
    id: "8b",
    triggerPhrase: "botox",
    responseType: "image",
    responseText: "Veja alguns resultados do Botox — a diferença é incrível!",
    mediaUrl: "https://www.midlandsderm.com/wp-content/uploads/2019/04/Botox-Fillers-Dermatology-1024x580.jpg"
  },
  {
    id: "9",
    triggerPhrase: "implante",
    responseType: "image",
    responseText: "Realizamos reabilitação oral total com Implantologia moderna. Utilizamos a técnica All-on-4 ou All-on-6 para fixar uma dentadura completa sobre implantes de titânio (Muitas vezes em apenas um dia - Carga Imediata). Trabalhamos com Resina Acrílica, Zircónia (a mais resistente) e Porcelana.",
    mediaUrl: "https://www.midlandsderm.com/wp-content/uploads/2019/04/Botox-Fillers-Dermatology-1024x580.jpg"
  },
  {
    id: "10",
    triggerPhrase: "harmonizacao",
    responseType: "image",
    responseText: "Nossos tratamentos de Harmonização Orofacial incluem:\n- Full Face (Rejuvenescimento global com preenchedores, bioestimuladores de colágeno e Lifting 3D Regenerativo)\n- Preenchimento Labial (com ácido hialurônico para volume e hidratação naturais)\n- Rejuvenescimento (Toxina botulínica e mais).",
    mediaUrl: "https://www.midlandsderm.com/wp-content/uploads/2019/04/Botox-Fillers-Dermatology-1024x580.jpg"
  },
  {
    id: "11",
    triggerPhrase: "full face",
    responseType: "image",
    responseText: "O tratamento Full Face analisa o seu rosto como um todo para restaurar o volume natural (com preenchedores e bioestimuladores de colágeno) e melhorar os contornos proporcionando um Lifting 3D Regenerativo sem cirurgia e respeitando a sua harmonia.",
    mediaUrl: "https://www.midlandsderm.com/wp-content/uploads/2019/04/Botox-Fillers-Dermatology-1024x580.jpg"
  },
  {
    id: "12",
    triggerPhrase: "preenchimento labial",
    responseType: "image",
    responseText: "Com o nosso preenchimento labial (à base de ácido hialurônico de alta qualidade), podemos realçar o volume, melhorar o contorno e devolver a hidratação profunda dos seus lábios, num procedimento rápido e seguro de apenas 30-40 minutos.",
    mediaUrl: "https://www.midlandsderm.com/wp-content/uploads/2019/04/Botox-Fillers-Dermatology-1024x580.jpg"
  },
  {
    id: "13",
    triggerPhrase: "audio",
    responseType: "audio",
    responseText: "Temos uma equipe incrível esperando por si! 🦷✨",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    audioDuration: "0:12"
  },
  {
    id: "14",
    triggerPhrase: "video",
    responseType: "video",
    responseText: "Veja um pouco do nosso espaço!",
    mediaUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: "15",
    triggerPhrase: "foto",
    responseType: "image",
    responseText: "Esta é a nossa clínica. Um refúgio de tranquilidade e modernidade.",
    mediaUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=600&auto=format&fit=crop"
  }
];
