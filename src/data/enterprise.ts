export interface EnterpriseMilestone {
  year: string
  title: string
  description: string
}

// All enterprise-history content is normalized from docs/materials/introduction.md.
export const enterprise = {
  name: '嘉兴市四之堂医药连锁有限责任公司',
  founded: '1914年（民国三年）',
  founder: '马溯秋',
  nameMeaning: '天护之、地养之、你病之、我医之',
  paragraphs: [
    '四之堂始创于1914年（民国三年），由海宁望族马家的马溯秋创办。早期药店遵循古方，选用各地道地药材与饮片，并制作丸、散、膏、丹等传统剂型，在当地积累了良好声誉。',
    '据材料记载，民国初年面对当地百姓受风湿、类风湿、痛风与历节病困扰，海宁马桥老街的四之堂药店曾综合民间验方，形成祛风活血浸洗方等外治经验。此处仅作企业历史介绍，不作为诊疗或用药建议。',
    '改革开放以来，企业经历升级改制、增资扩股，逐步发展为药品零售连锁经营企业。材料记载，公司在海宁开设了10多家药店和4家中西医诊所，并在四之堂发源地马桥桐木商业街设立四之堂医馆。',
  ],
  milestones: [
    {
      year: '1914',
      title: '四之堂始创',
      description: '马溯秋在海宁创办四之堂，堂名寓意“天护之、地养之、你病之、我医之”。',
    },
    {
      year: '1957',
      title: '完成公私合营',
      description: '四之堂汇集周边几家小药店，成立马桥国新药合作商店，归属于马桥供销社。',
    },
    {
      year: '2013',
      title: '恢复四之堂字号',
      description: '企业于5月恢复使用“四之堂”字号，成立嘉兴市四之堂医药连锁有限责任公司。',
    },
    {
      year: '2019',
      title: '获认定为老字号企业',
      description: '经嘉兴市商务局认定为老字号企业。',
    },
  ] satisfies EnterpriseMilestone[],
}
