"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { AdminBadge, AdminEmpty } from "@/components/admin/admin-ui";
import { ListPagination } from "@/components/admin/list-pagination";
import { normalizeAdminText } from "@/lib/admin-display";

type ContentRow = { id: string; title: string; description: string; slug: string; active: boolean; href: string; values: string[] };
export function AdminContentList({ rows, columns, label }: { rows: ContentRow[]; columns: string[]; label: string }) {
  const [query,setQuery]=useState("");
  const [state,setState]=useState("all");
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);
  const normalized=normalizeAdminText(useDeferredValue(query));
  const filtered=rows.filter((row)=>(state==="all" || row.active===(state==="active")) && normalizeAdminText([row.title,row.slug,row.description,...row.values].join(" ")).includes(normalized));
  const currentPage=Math.min(page,Math.max(1,Math.ceil(filtered.length/pageSize)));
  function reset(){setQuery("");setState("all");setPage(1);}
  return <div className="space-y-4">
    <section className="admin-toolbar" aria-label={`Filtrar ${label}`}><label className="admin-search">Buscar {label}<input type="search" value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1);}} placeholder="Nombre, descripción o datos del registro"/></label><label>Estado<select value={state} onChange={(e)=>{setState(e.target.value);setPage(1);}}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label><button type="button" className="admin-button" onClick={reset}>Limpiar</button></section>
    <p className="admin-muted" role="status">{filtered.length} de {rows.length} {label}</p>
    <div className="admin-table-wrap">{filtered.length ? <><table className="admin-table admin-table--responsive"><caption className="sr-only">Administración de {label}</caption><thead><tr><th style={{width:"38%"}}>Nombre / descripción</th>{columns.map((column)=><th key={column}>{column}</th>)}<th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtered.slice((currentPage-1)*pageSize,currentPage*pageSize).map((row)=><tr key={row.id}><td data-label="Nombre"><div><strong>{row.title}</strong><span className="admin-cell-note">/{row.slug}</span><span className="admin-cell-note">{row.description}</span></div></td>{row.values.map((value,index)=><td key={columns[index]} data-label={columns[index]}>{value}</td>)}<td data-label="Estado"><AdminBadge tone={row.active?"success":"neutral"}>{row.active?"Activo":"Inactivo"}</AdminBadge></td><td data-label="Acciones"><Link className="admin-button" href={row.href}>Editar</Link></td></tr>)}</tbody></table><ListPagination page={currentPage} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} onPageSizeChange={(size)=>{setPageSize(size);setPage(1);}} itemLabel={label}/></>:<AdminEmpty>No encontramos registros. <button type="button" className="underline" onClick={reset}>Limpiar filtros</button></AdminEmpty>}</div>
  </div>;
}
