#!/usr/bin/env python3
"""
ErreBe · Comparación de la ronda 1 (Lab 9.2) y la ronda 2 (Hito 2 v2) del modo validación.

Lee los CSV o JSON exportados desde ?test=1 (o la hoja "Resultados" de la planilla descargada como CSV)
y calcula, por tarea y por ronda: % de tareas completadas, mediana de tiempo y de clics, y los promedios
Likert. Los porcentajes se calculan SIEMPRE sobre el total de sesiones válidas de la ronda: si una sesión
no llegó a una tarea, cuenta como no completada.

Uso:
  python3 validacion/comparar_rondas.py --ronda1 carpeta_o_archivos... --ronda2 carpeta_o_archivos...
  python3 validacion/comparar_rondas.py carpeta_o_archivos...      # ronda según la columna/campo "version"

Opciones:
  --salida resumen.csv    guarda además las métricas en formato largo (una fila por métrica)
  --incluir-p00           incluye las corridas del equipo con el código P00 (por defecto se excluyen)
  --solo-completas        considera válidas solo las sesiones que terminaron (estado "completa")
  --sin-deduplicar        no junta la misma sesión exportada en dos archivos distintos

Cómo se identifica una sesión: por archivo y observador (varias sesiones se exportaron con el mismo
código, p. ej. P03), más el código y el sesion_id cuando existe. El CSV y el JSON de una misma descarga
(mismo nombre, distinta extensión) cuentan como un solo archivo. Si el mismo sesion_id aparece en dos
archivos distintos (por ejemplo, el CSV individual y "Descargar todos"), se cuenta una vez y se avisa.

Solo usa la biblioteca estándar de Python 3.
"""
import argparse
import csv
import io
import json
import os
import statistics
import sys

TAREAS = [
    ('registrar_acuerdo', 'T1 Registrar y enviar el acuerdo', 'R1'),
    ('decidir_equipos', 'T2 Decidir qué equipo llevar', 'R2'),
    ('prueba_sonido', 'T3 Encontrar la prueba de sonido', 'R3'),
    ('recuperar_acuerdo', 'T4 Reabrir el acuerdo', 'R1'),
]
LIKERT = [('claridad', 'Claridad'), ('utilidad', 'Utilidad'), ('usaria', 'Intención de uso')]
VERSION_R2 = 'hito 2'


def archivos(rutas):
    out = []
    for r in rutas:
        if os.path.isdir(r):
            for base, _, fs in os.walk(r):
                out += [os.path.join(base, f) for f in sorted(fs) if f.lower().endswith(('.csv', '.json'))]
        elif os.path.isfile(r):
            out.append(r)
        else:
            print(f'Aviso: no existe {r}', file=sys.stderr)
    return out


def num(v):
    try:
        return float(str(v).replace(',', '.'))
    except (TypeError, ValueError):
        return None


def si(v):
    return str(v).strip().lower() in ('si', 'sí', 'true', '1', 'yes')


def nueva_sesion(archivo, observador, participante, sesion_id, version, fecha, estado):
    return {'archivo': archivo, 'observador': observador or '', 'participante': participante or '', 'sesion_id': sesion_id or '',
            'version': version or '', 'fecha': fecha or '', 'estado': estado or '', 'tareas': {}, 'likert': {}}


def leer_json(ruta, stem):
    with open(ruta, encoding='utf-8-sig') as f:
        datos = json.load(f)
    lista = datos if isinstance(datos, list) else [datos]
    out = []
    for r in lista:
        if not isinstance(r, dict) or 'tareas' not in r:
            continue
        sid = r.get('id') or ((r.get('participante') or '') + '-' + (r.get('inicio') or ''))
        s = nueva_sesion(stem, r.get('observador'), r.get('participante'), sid, r.get('version'), r.get('fecha'),
                         'completa' if r.get('fin') else 'parcial')
        for t in r.get('tareas') or []:
            s['tareas'][t.get('id')] = {
                'completada': bool(t.get('completada')), 'tiempo_s': num(t.get('tiempo_s')), 'clics': num(t.get('clics')),
                'primera_seccion': t.get('primera_seccion') or '', 'pasos_formulario': num(t.get('pasos_formulario')),
                'guardo_borrador': t.get('guardo_borrador') or ''}
        for k, _ in LIKERT:
            s['likert'][k] = num((r.get('likert') or {}).get(k))
        out.append(s)
    return out


def leer_csv(ruta, stem):
    with open(ruta, encoding='utf-8-sig', newline='') as f:
        texto = f.read()
    try:
        dialecto = csv.Sniffer().sniff(texto.split('\n', 1)[0], delimiters=',;\t')
    except csv.Error:
        dialecto = csv.excel
    filas = list(csv.DictReader(io.StringIO(texto), dialect=dialecto))
    sesiones = {}
    for f in filas:
        f = {(k or '').strip(): (v or '').strip() for k, v in f.items()}
        if not f.get('tarea_id'):
            continue
        clave = f.get('sesion_id') or (f.get('observador', '') + '|' + f.get('participante', '') + '|' + f.get('fecha', ''))
        s = sesiones.get(clave)
        if s is None:
            s = sesiones[clave] = nueva_sesion(stem, f.get('observador'), f.get('participante'), f.get('sesion_id'),
                                               f.get('version'), f.get('fecha'), f.get('estado'))
        s['tareas'][f['tarea_id']] = {
            'completada': si(f.get('completada')), 'tiempo_s': num(f.get('tiempo_s')), 'clics': num(f.get('clics')),
            'primera_seccion': f.get('primera_seccion', ''), 'pasos_formulario': num(f.get('pasos_formulario')),
            'guardo_borrador': f.get('guardo_borrador', '')}
        for k, _ in LIKERT:
            v = num(f.get('likert_' + k))
            if v is not None:
                s['likert'][k] = v
    for s in sesiones.values():
        if not s['estado']:
            s['estado'] = 'completa' if len(s['tareas']) == len(TAREAS) and all(s['likert'].get(k) for k, _ in LIKERT) else 'parcial'
    return list(sesiones.values())


def cargar(rutas, args):
    """Devuelve las sesiones de las rutas, sin duplicados (CSV+JSON de la misma descarga, mismo sesion_id)."""
    por_clave, vistos, avisos = {}, {}, []
    lista = archivos(rutas)
    con_json = {os.path.splitext(r)[0] for r in lista if r.lower().endswith('.json')}
    for ruta in lista:
        stem = os.path.splitext(os.path.basename(ruta))[0]
        if ruta.lower().endswith('.csv') and os.path.splitext(ruta)[0] in con_json:
            continue  # misma descarga en CSV y JSON: basta el JSON
        try:
            ses = leer_json(ruta, stem) if ruta.lower().endswith('.json') else leer_csv(ruta, stem)
        except Exception as e:  # archivo dañado o con otro formato: se informa y se sigue
            print(f'Aviso: no se pudo leer {ruta}: {e}', file=sys.stderr)
            continue
        for s in ses:
            clave = (s['archivo'], s['observador'], s['participante'], s['sesion_id'] or s['fecha'])
            if clave in por_clave:  # el CSV y el JSON de la misma descarga
                continue
            if s['sesion_id'] and not args.sin_deduplicar:
                otro = vistos.get(s['sesion_id'])
                if otro and otro != s['archivo']:
                    avisos.append(f"{s['participante']} ({s['observador'] or 'sin observador'}) aparece en {otro} y en {s['archivo']}: se cuenta una vez")
                    continue
                vistos[s['sesion_id']] = s['archivo']
            por_clave[clave] = s
    return list(por_clave.values()), avisos


def valida(s, args):
    if not s['tareas']:
        return False
    if not args.incluir_p00 and s['participante'].upper() == 'P00':
        return False
    if args.solo_completas and s['estado'] != 'completa':
        return False
    return True


def mediana(xs):
    xs = [x for x in xs if x is not None]
    return statistics.median(xs) if xs else None


def promedio(xs):
    xs = [x for x in xs if x is not None]
    return sum(xs) / len(xs) if xs else None


def metricas(sesiones):
    N = len(sesiones)
    m = {'N': N, 'tareas': {}, 'likert': {}}
    total_ok = 0
    for tid, _, _ in TAREAS:
        hechas = [s['tareas'][tid] for s in sesiones if tid in s['tareas']]
        ok = sum(1 for t in hechas if t['completada'])
        total_ok += ok
        primeras = {}
        for t in hechas:
            if t['primera_seccion']:
                primeras[t['primera_seccion']] = primeras.get(t['primera_seccion'], 0) + 1
        m['tareas'][tid] = {
            'registradas': len(hechas), 'completadas': ok, 'pct': (100.0 * ok / N) if N else None,
            'mediana_tiempo': mediana([t['tiempo_s'] for t in hechas]), 'mediana_clics': mediana([t['clics'] for t in hechas]),
            'primera_seccion': primeras,
            'pasos_mediana': mediana([t['pasos_formulario'] for t in hechas]) if any(t['pasos_formulario'] is not None for t in hechas) else None,
            'borrador': sum(1 for t in hechas if str(t['guardo_borrador']).lower() == 'si'),
            'con_dato_borrador': sum(1 for t in hechas if t['guardo_borrador'] != ''),
        }
    m['sin_ayuda'] = {'ok': total_ok, 'total': N * len(TAREAS), 'pct': (100.0 * total_ok / (N * len(TAREAS))) if N else None}
    for k, _ in LIKERT:
        vals = [s['likert'].get(k) for s in sesiones]
        m['likert'][k] = {'promedio': promedio(vals), 'n': len([v for v in vals if v is not None])}
    return m


def fmt(v, dec=0, suf=''):
    if v is None:
        return '—'
    return (f'{v:.{dec}f}'.replace('.', ',')) + suf


def imprimir(rondas):
    nombres = list(rondas)
    print('# ErreBe · Comparación de rondas del modo validación\n')
    for r in nombres:
        m = rondas[r]['m']
        print(f"- **{r}**: {m['N']} sesiones válidas · versiones: {', '.join(sorted(rondas[r]['versiones'])) or 'sin dato'}")
    print('\n## Tareas (porcentaje sobre el total de sesiones válidas de cada ronda)\n')
    cab = '| Tarea | Req. | ' + ' | '.join(f'{r}: completadas' for r in nombres) + ' | ' + ' | '.join(f'{r}: mediana tiempo' for r in nombres) + ' | ' + ' | '.join(f'{r}: mediana clics' for r in nombres) + ' |'
    print(cab)
    print('|' + '---|' * (2 + 3 * len(nombres)))
    for tid, nombre, req in TAREAS:
        celdas = []
        for r in nombres:
            t, N = rondas[r]['m']['tareas'][tid], rondas[r]['m']['N']
            celdas.append(f"{fmt(t['pct'], 0, ' %')} ({t['completadas']} de {N})")
        celdas += [fmt(rondas[r]['m']['tareas'][tid]['mediana_tiempo'], 0, ' s') for r in nombres]
        celdas += [fmt(rondas[r]['m']['tareas'][tid]['mediana_clics'], 0) for r in nombres]
        print(f'| {nombre} | {req} | ' + ' | '.join(celdas) + ' |')
    print('| **Total de tareas sin ayuda** | R4 | ' + ' | '.join(
        f"{fmt(rondas[r]['m']['sin_ayuda']['pct'], 0, ' %')} ({rondas[r]['m']['sin_ayuda']['ok']} de {rondas[r]['m']['sin_ayuda']['total']})" for r in nombres)
        + ' |' + ' |' * (2 * len(nombres)))
    print('\n## Valoración promedio (1 a 5)\n')
    print('| Pregunta | ' + ' | '.join(nombres) + ' |')
    print('|---|' + '---|' * len(nombres))
    for k, nombre in LIKERT:
        print(f'| {nombre} | ' + ' | '.join(f"{fmt(rondas[r]['m']['likert'][k]['promedio'], 1)} (n={rondas[r]['m']['likert'][k]['n']})" for r in nombres) + ' |')
    print('\n## Registro nuevo de la ronda 2 (solo existe en sesiones de la versión Hito 2 v2)\n')
    for r in nombres:
        m = rondas[r]['m']
        t1 = m['tareas']['registrar_acuerdo']
        if not t1['con_dato_borrador'] and t1['pasos_mediana'] is None:
            print(f'- {r}: sin estos datos.')
            continue
        print(f"- {r}: en T1, {t1['borrador']} de {t1['con_dato_borrador']} guardaron un borrador en vez de enviar; "
              f"mediana de pasos del formulario recorridos: {fmt(t1['pasos_mediana'], 0)} de 4.")
        for tid, nombre, _ in TAREAS:
            p = m['tareas'][tid]['primera_seccion']
            if p:
                print(f"  - {nombre}, primera sección abierta: " + ', '.join(f'{k} ({v})' for k, v in sorted(p.items(), key=lambda x: -x[1])))


def guardar_csv(rondas, ruta):
    with open(ruta, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['ronda', 'tarea', 'metrica', 'valor'])
        for r, d in rondas.items():
            m = d['m']
            w.writerow([r, '', 'sesiones_validas', m['N']])
            for tid, _, _ in TAREAS:
                t = m['tareas'][tid]
                for k in ('completadas', 'pct', 'mediana_tiempo', 'mediana_clics', 'pasos_mediana', 'borrador'):
                    w.writerow([r, tid, k, '' if t[k] is None else t[k]])
            w.writerow([r, '', 'sin_ayuda_pct', '' if m['sin_ayuda']['pct'] is None else m['sin_ayuda']['pct']])
            for k, _ in LIKERT:
                v = m['likert'][k]['promedio']
                w.writerow([r, '', 'likert_' + k, '' if v is None else round(v, 2)])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('rutas', nargs='*', help='archivos o carpetas; la ronda se toma de la versión registrada')
    ap.add_argument('--ronda1', nargs='+', default=[])
    ap.add_argument('--ronda2', nargs='+', default=[])
    ap.add_argument('--salida')
    ap.add_argument('--incluir-p00', action='store_true')
    ap.add_argument('--solo-completas', action='store_true')
    ap.add_argument('--sin-deduplicar', action='store_true')
    args = ap.parse_args()
    if not (args.rutas or args.ronda1 or args.ronda2):
        ap.error('indica archivos o carpetas')

    grupos = {'Ronda 1': [], 'Ronda 2': []}
    avisos = []
    for nombre, rutas in (('Ronda 1', args.ronda1), ('Ronda 2', args.ronda2)):
        if rutas:
            ses, av = cargar(rutas, args)
            grupos[nombre] += ses
            avisos += av
    if args.rutas:
        ses, av = cargar(args.rutas, args)
        avisos += av
        for s in ses:
            grupos['Ronda 2' if VERSION_R2 in s['version'].lower() else 'Ronda 1'].append(s)

    rondas = {}
    for nombre, ses in grupos.items():
        val = [s for s in ses if valida(s, args)]
        if ses or nombre == 'Ronda 1':
            rondas[nombre] = {'m': metricas(val), 'versiones': {s['version'] for s in val if s['version']}}
    imprimir(rondas)
    if avisos:
        print('\n## Avisos\n')
        for a in avisos:
            print('- ' + a)
    if args.salida:
        guardar_csv(rondas, args.salida)
        print(f'\nMétricas guardadas en {args.salida}')


if __name__ == '__main__':
    main()
