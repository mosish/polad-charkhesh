/** Small category sketches, decorative and distinct from product/CAD imagery. */
export default function CategoryIcon({category}:{category:string}) {
 const rails=<><path d="M8 5h40v6H8zM8 29h40v6H8z"/><path d="M5 38h46" strokeDasharray="2 3" opacity=".45"/></>;
 let shape;
 switch(category){
  case 'roller':shape=<>{rails}<path d="M17 14l7 2v10l-7 2zM39 14l-7 2v10l7 2z"/></>;break;
  case 'spherical':shape=<>{rails}<path d="M17 13q-5 8 0 14h7q5-8 0-14zM32 13q-5 8 0 14h7q5-8 0-14z"/></>;break;
  case 'cylindrical':shape=<>{rails}<rect x="16" y="14" width="9" height="12" rx="1"/><rect x="31" y="14" width="9" height="12" rx="1"/></>;break;
  case 'thrust':shape=<><path d="M10 6v29h7V6zM39 6v29h7V6zM17 14h22v12H17z"/><path d="M23 14v12M33 14v12M5 38h46"/></>;break;
  case 'housing':shape=<><path d="M7 32h42v5H7zM12 32V21a16 16 0 0132 0v11M16 32v-5M40 32v-5"/><circle cx="28" cy="21" r="9"/><circle cx="28" cy="21" r="4"/><path d="M10 34h4M42 34h4"/></>;break;
  case 'seal':shape=<><path d="M8 7h40v7H35l-7 8 7 7h13v6H8V7zM14 13v16h9l5-7-5-9zM39 14v15"/><path d="M5 38h46" strokeDasharray="2 3" opacity=".45"/></>;break;
  case 'lubricant':shape=<><path d="M20 7h17v6H20zM18 13h21v23H18zM18 20h21M18 30h21M11 15s-7 9-7 13a7 7 0 0014 0c0-4-7-13-7-13z"/></>;break;
  default:shape=<>{rails}<circle cx="18" cy="20" r="6"/><circle cx="38" cy="20" r="6"/></>;
 }
 return <svg className="category-icon" viewBox="0 0 56 42" width="56" height="42" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shape}</svg>;
}
