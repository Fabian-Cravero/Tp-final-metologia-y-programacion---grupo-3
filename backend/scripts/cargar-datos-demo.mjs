/**
 * Carga datos de prueba en el HIS usando la API (lo mismo que se haría a mano en Swagger).
 *
 * Uso, con el backend levantado (npm run start:dev) y desde la carpeta backend:
 *   npm run seed:demo
 *
 * Se puede correr más de una vez: lo que ya existe se reutiliza y no se duplica.
 * Toma el admin de ADMIN_EMAIL / ADMIN_PASSWORD del .env. API_URL cambia la dirección (por defecto http://localhost:3000).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- configuración ----------
const env = leerEnv(join(dirname(fileURLToPath(import.meta.url)), '..', '.env'));
const API = process.env.API_URL ?? 'http://localhost:3000';
const ADMIN = { email: env.ADMIN_EMAIL ?? 'admin@hospital.test', password: env.ADMIN_PASSWORD };

const USUARIOS = [
  { clave: 'medico', nombre: 'Dra. Laura Martínez', email: 'medico@hospital.test', password: 'medico1234', rol: 'medico' },
  { clave: 'cardio', nombre: 'Dr. Martín Sosa', email: 'cardio@hospital.test', password: 'cardio1234', rol: 'medico' },
  { clave: 'enfermero', nombre: 'Enf. Pablo Ruiz', email: 'enfermero@hospital.test', password: 'enfermero1234', rol: 'enfermero' },
  { clave: 'recepcion', nombre: 'Sofía Recepción', email: 'recepcion@hospital.test', password: 'recepcion1234', rol: 'recepcionista' },
];
const PACIENTE_USUARIO = { nombre: 'Juan Gómez', email: 'juan@hospital.test', password: 'paciente1234' };

const MEDICOS = [
  { usuario: 'medico', matricula: 'MP-3001', nombre: 'Laura', apellido: 'Martínez', especialidad: 'Clínica médica' },
  { usuario: 'cardio', matricula: 'MP-3002', nombre: 'Martín', apellido: 'Sosa', especialidad: 'Cardiología' },
];

const PACIENTES = [
  { dni: '28111222', nombre: 'Juan', apellido: 'Gómez', fechaNacimiento: '1985-03-14', telefono: '3511234567', email: 'juan@hospital.test' },
  { dni: '33444555', nombre: 'María', apellido: 'López', fechaNacimiento: '1992-07-02', telefono: '3517654321' },
  { dni: '25666777', nombre: 'Carlos', apellido: 'Fernández', fechaNacimiento: '1978-11-23' },
  { dni: '40888999', nombre: 'Lucía', apellido: 'Romero', fechaNacimiento: '2001-01-30', email: 'lucia.romero@mail.com' },
  { dni: '30222333', nombre: 'Jorge', apellido: 'Díaz', fechaNacimiento: '1969-05-08' },
  { dni: '45111000', nombre: 'Valentina', apellido: 'Torres', fechaNacimiento: '2015-09-12' },
];

const CAMAS = [
  ['A-101', 'Clínica médica'], ['A-102', 'Clínica médica'], ['A-103', 'Clínica médica'], ['A-104', 'Clínica médica'],
  ['UTI-1', 'Terapia intensiva'], ['UTI-2', 'Terapia intensiva'], ['UTI-3', 'Terapia intensiva'],
  ['P-1', 'Pediatría'], ['P-2', 'Pediatría'],
];

const INSUMOS = [
  { nombre: 'Ampolla paracetamol', unidad: 'unidad', umbralMinimo: 5, precioUnitario: '120.50', stock: 40 },
  { nombre: 'Suero fisiológico 500 ml', unidad: 'sachet', umbralMinimo: 10, precioUnitario: '850.00', stock: 30 },
  { nombre: 'Ibuprofeno 400 mg', unidad: 'comprimido', umbralMinimo: 20, precioUnitario: '95.00', stock: 100 },
  { nombre: 'Gasas estériles', unidad: 'paquete', umbralMinimo: 15, precioUnitario: '310.00', stock: 8 }, // queda bajo el mínimo a propósito
];

// ---------- utilidades ----------
function leerEnv(ruta) {
  try {
    return Object.fromEntries(
      readFileSync(ruta, 'utf8')
        .split(/\r?\n/)
        .filter((l) => /^\s*[A-Z_]+\s*=/.test(l))
        .map((l) => {
          const i = l.indexOf('=');
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
        }),
    );
  } catch {
    return {};
  }
}

let creados = 0;
let existentes = 0;
const avisos = [];

/** Llama a la API. Devuelve { status, data } sin lanzar por errores HTTP. */
async function api(metodo, ruta, { token, body, query } = {}) {
  const url = new URL(ruta, API);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  let r;
  try {
    r = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(`No se pudo conectar con ${API}. ¿Está levantado el backend (npm run start:dev)?`);
  }
  const texto = await r.text();
  let data = null;
  try { data = texto ? JSON.parse(texto) : null; } catch { data = texto; }
  return { status: r.status, data };
}

function mensaje(r) {
  const m = r.data?.message;
  return Array.isArray(m) ? m.join('. ') : (m ?? `HTTP ${r.status}`);
}

/** Exige un código esperado; si no, corta con un mensaje claro. */
function exigir(r, esperados, que) {
  if (!esperados.includes(r.status)) throw new Error(`${que}: ${r.status} ${mensaje(r)}`);
  return r.data;
}

async function login(email, password) {
  const r = await api('POST', '/iam/login', { body: { email, password } });
  if (r.status !== 200) return null;
  return { token: r.data.accessToken, usuario: r.data.usuario };
}

function fechaLocal(diasDesdeHoy, horaMin) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoy);
  const [h, m] = horaMin.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function paso(titulo) {
  console.log(`\n▸ ${titulo}`);
}

// ---------- carga ----------
async function main() {
  console.log(`HIS · carga de datos de demo contra ${API}`);
  if (!ADMIN.password) throw new Error('Falta ADMIN_PASSWORD en backend/.env');

  const admin = await login(ADMIN.email, ADMIN.password);
  if (!admin) throw new Error(`No se pudo entrar como ${ADMIN.email}. Revisá ADMIN_EMAIL / ADMIN_PASSWORD del .env.`);
  const A = admin.token;

  // 1. Usuarios
  paso('Usuarios');
  const sesiones = {};
  for (const u of USUARIOS) {
    const r = await api('POST', '/iam/usuarios', { token: A, body: { nombre: u.nombre, email: u.email, password: u.password, rol: u.rol } });
    if (r.status === 201) creados++;
    else if (r.status === 422) existentes++;
    else exigir(r, [201], `Crear usuario ${u.email}`);
    const s = await login(u.email, u.password);
    if (!s) throw new Error(`El usuario ${u.email} ya existía con otra contraseña. Cambiala o borrá ese usuario y volvé a correr.`);
    sesiones[u.clave] = s;
    console.log(`  ${u.email} / ${u.password} (${u.rol})`);
  }
  const rp = await api('POST', '/iam/registro', { body: PACIENTE_USUARIO });
  if (rp.status === 201) creados++; else if (rp.status === 422) existentes++; else exigir(rp, [201], 'Registro del paciente');
  console.log(`  ${PACIENTE_USUARIO.email} / ${PACIENTE_USUARIO.password} (paciente)`);

  // 2. Médicos vinculados a sus usuarios
  paso('Médicos');
  const medicos = {};
  let lista = exigir(await api('GET', '/admisiones/medicos', { token: A }), [200], 'Listar médicos');
  for (const m of MEDICOS) {
    const usuarioId = sesiones[m.usuario].usuario.id;
    let medico = lista.find((x) => x.usuarioId === usuarioId) ?? lista.find((x) => x.matricula === m.matricula);
    if (!medico) {
      const { usuario: _u, ...datos } = m;
      medico = exigir(await api('POST', '/admisiones/medicos', { token: A, body: { ...datos, usuarioId } }), [201], `Crear médico ${m.matricula}`);
      creados++;
    } else {
      existentes++;
      if (medico.usuarioId !== usuarioId) avisos.push(`El médico ${medico.matricula} ya existía sin vincular a ${m.usuario}@: no firma evoluciones con ese usuario.`);
    }
    medicos[m.usuario] = medico;
    console.log(`  ${medico.apellido}, ${medico.nombre} · ${medico.matricula}`);
  }

  // 3. Pacientes
  paso('Pacientes');
  const pacientes = [];
  for (const p of PACIENTES) {
    const r = await api('POST', '/admisiones/pacientes', { token: A, body: p });
    let paciente;
    if (r.status === 201) { paciente = r.data; creados++; }
    else if (r.status === 422) {
      const encontrados = exigir(await api('GET', '/admisiones/pacientes', { token: A, query: { q: p.dni } }), [200], 'Buscar paciente');
      paciente = encontrados.find((x) => x.dni === p.dni);
      existentes++;
    } else exigir(r, [201], `Crear paciente ${p.dni}`);
    pacientes.push(paciente);
    console.log(`  ${paciente.apellido}, ${paciente.nombre} · DNI ${paciente.dni}`);
  }
  const [juan, maria, carlos, lucia, jorge, valentina] = pacientes;

  // 4. Coberturas de los pacientes
  paso('Coberturas');
  const coberturas = exigir(await api('GET', '/facturacion/coberturas', { token: A }), [200], 'Listar coberturas');
  const prepaga = coberturas.find((c) => c.tipo === 'prepaga');
  const publica = coberturas.find((c) => c.tipo === 'publica');
  for (const [paciente, cobertura] of [[maria, prepaga], [lucia, prepaga], [carlos, publica]]) {
    if (!cobertura) { avisos.push('Faltan las coberturas iniciales: reiniciá el backend para que se creen.'); break; }
    exigir(await api('PATCH', `/facturacion/pacientes/${paciente.id}/cobertura`, { token: A, body: { coberturaId: cobertura.id } }), [200], 'Asignar cobertura');
    console.log(`  ${paciente.apellido}: ${cobertura.nombre}`);
  }

  // 5. Turnos de mañana y pasado (409 = horario ya tomado: se reutiliza)
  paso('Turnos');
  const recep = sesiones.recepcion.token;
  const agenda = [
    [juan, 'medico', 1, '09:00', 'Control'], [maria, 'medico', 1, '09:30', 'Dolor de cabeza'], [carlos, 'medico', 1, '10:00', 'Resultados de laboratorio'],
    [lucia, 'cardio', 1, '11:00', 'Chequeo cardiológico'], [jorge, 'cardio', 1, '11:30', 'Hipertensión'], [valentina, 'medico', 2, '08:30', 'Control pediátrico'],
  ];
  const turnosCreados = [];
  for (const [paciente, medico, dias, hora, motivo] of agenda) {
    const r = await api('POST', '/admisiones/turnos', {
      token: recep,
      body: { pacienteId: paciente.id, medicoId: medicos[medico].id, fechaHora: fechaLocal(dias, hora), motivo },
    });
    if (r.status === 201) { creados++; turnosCreados.push(r.data); console.log(`  ${hora} +${dias}d · ${paciente.apellido} con ${medicos[medico].apellido}`); }
    else if (r.status === 409) existentes++;
    else exigir(r, [201], 'Reservar turno');
  }
  // Algunos turnos avanzan de estado para que la agenda no esté toda igual.
  if (turnosCreados[0]) await api('PATCH', `/admisiones/turnos/${turnosCreados[0].id}/confirmar`, { token: recep });
  if (turnosCreados[1]) {
    await api('PATCH', `/admisiones/turnos/${turnosCreados[1].id}/confirmar`, { token: recep });
    await api('PATCH', `/admisiones/turnos/${turnosCreados[1].id}/llegada`, { token: recep });
  }

  // 6. Sala de espera (solo si está vacía)
  paso('Sala de espera');
  const cola = exigir(await api('GET', '/admisiones/cola', { token: A, query: { medicoId: medicos.medico.id } }), [200], 'Ver cola');
  if (cola.length === 0) {
    for (const [paciente, prioridad] of [[jorge, 'normal'], [lucia, 'urgente'], [carlos, 'codigo_rojo']]) {
      exigir(await api('POST', '/admisiones/cola', { token: recep, body: { pacienteId: paciente.id, medicoId: medicos.medico.id, prioridad } }), [201], 'Agregar a la cola');
      creados++;
    }
    console.log('  3 pacientes esperando (normal, urgente, código rojo)');
  } else console.log(`  ya hay ${cola.length} esperando`);

  // 7. Camas
  paso('Camas');
  for (const [codigo, sector] of CAMAS) {
    const r = await api('POST', '/camas', { token: A, body: { codigo, sector } });
    if (r.status === 201) creados++; else if (r.status === 422) existentes++; else exigir(r, [201], `Crear cama ${codigo}`);
  }
  const mapa = exigir(await api('GET', '/camas/mapa', { token: A }), [200], 'Mapa de camas');
  const cama = (codigo) => mapa.flatMap((s) => s.camas).find((c) => c.codigo === codigo);
  for (const [codigo, paciente] of [['A-102', jorge], ['UTI-1', carlos]]) {
    const c = cama(codigo);
    if (c?.estado === 'libre') {
      const r = await api('POST', `/camas/${c.id}/asignar`, { token: recep, body: { pacienteId: paciente.id } });
      if (r.status === 201) console.log(`  ${codigo} ocupada por ${paciente.apellido}`);
    }
  }
  const p2 = cama('P-2');
  if (p2?.estado === 'libre') await api('PATCH', `/camas/${p2.id}/bloquear`, { token: A });
  console.log(`  ${CAMAS.length} camas en 3 sectores (P-2 bloqueada)`);

  // 8. Insumos y stock (el nombre es único: se busca antes de crear)
  paso('Inventario');
  let insumos = exigir(await api('GET', '/camas/insumos', { token: A }), [200], 'Listar insumos');
  for (const i of INSUMOS) {
    if (!insumos.some((x) => x.nombre === i.nombre)) {
      const { stock: _s, ...datos } = i;
      exigir(await api('POST', '/camas/insumos', { token: A, body: datos }), [201], `Crear insumo ${i.nombre}`);
      creados++;
    } else existentes++;
  }
  insumos = exigir(await api('GET', '/camas/insumos', { token: A }), [200], 'Listar insumos');
  for (const i of INSUMOS) {
    const actual = insumos.find((x) => x.nombre === i.nombre);
    if (actual.stockTotal < i.stock) {
      await api('POST', `/camas/insumos/${actual.id}/stock`, { token: A, body: { cantidad: i.stock - actual.stockTotal, ubicacion: 'Depósito central' } });
    }
    console.log(`  ${i.nombre}: ${Math.max(actual.stockTotal, i.stock)} ${i.unidad}`);
  }
  const paracetamol = insumos.find((x) => x.nombre === 'Ampolla paracetamol');
  const suero = insumos.find((x) => x.nombre === 'Suero fisiológico 500 ml');

  // 9. Historias clínicas
  paso('Historias clínicas');
  const med = sesiones.medico.token;
  const enf = sesiones.enfermero.token;
  const historias = [
    [juan, 'A+', [['Penicilina', 'grave']], [['madre', 'Hipertensión arterial']], ['Consulta por control anual. Sin novedades.', 'Laboratorio normal. Se indica actividad física.']],
    [maria, '0-', [['Látex', 'moderada']], [['padre', 'Diabetes tipo 2']], ['Cefalea tensional. Se indica analgesia.']],
    [carlos, 'B+', [], [['hermano', 'Asma']], ['Ingresa a terapia por insuficiencia respiratoria. Se inicia oxigenoterapia.']],
  ];
  for (const [paciente, grupo, alergias, antecedentes, evoluciones] of historias) {
    exigir(await api('POST', `/historia-clinica/paciente/${paciente.id}`, { token: med, body: { grupoSanguineo: grupo } }), [201], 'Abrir historia');
    const actual = exigir(await api('GET', `/historia-clinica/paciente/${paciente.id}`, { token: med }), [200], 'Ver historia');
    if (actual.alergias.length || actual.antecedentes.length || actual.evoluciones.length) { existentes++; continue; }
    for (const [sustancia, severidad] of alergias) await api('POST', `/historia-clinica/paciente/${paciente.id}/alergias`, { token: enf, body: { sustancia, severidad } });
    for (const [parentesco, descripcion] of antecedentes) await api('POST', `/historia-clinica/paciente/${paciente.id}/antecedentes`, { token: enf, body: { parentesco, descripcion } });
    for (const nota of evoluciones) {
      const r = await api('POST', `/historia-clinica/paciente/${paciente.id}/evoluciones`, { token: med, body: { nota } });
      if (r.status !== 201) avisos.push(`Evolución de ${paciente.apellido}: ${mensaje(r)}`);
    }
    creados++;
    console.log(`  ${paciente.apellido}: grupo ${grupo}, ${alergias.length} alergia(s), ${evoluciones.length} evolución(es)`);
  }

  // 10. Atención y enfermería (solo si el paciente todavía no tiene signos vitales)
  paso('Atención y enfermería');
  const signos = [
    [carlos, [['frecuencia_cardiaca', 118], ['saturacion_o2', 88], ['temperatura', 38.4], ['frecuencia_respiratoria', 26]]],
    [jorge, [['presion_sistolica', 150], ['frecuencia_cardiaca', 82], ['temperatura', 36.7]]],
    [juan, [['frecuencia_cardiaca', 72], ['presion_sistolica', 120], ['saturacion_o2', 98]]],
  ];
  for (const [paciente, lista] of signos) {
    const previos = exigir(await api('GET', `/atencion-enfermeria/pacientes/${paciente.id}/signos-vitales`, { token: enf }), [200], 'Historial de signos');
    if (previos.length) { existentes++; continue; }
    for (const [tipo, valor] of lista) await api('POST', `/atencion-enfermeria/pacientes/${paciente.id}/signos-vitales`, { token: enf, body: { tipo, valor } });
    creados++;
    console.log(`  ${paciente.apellido}: ${lista.length} signos vitales`);
  }

  const protocolos = exigir(await api('GET', `/atencion-enfermeria/pacientes/${carlos.id}/protocolos`, { token: enf }), [200], 'Protocolos');
  if (!protocolos.length) {
    const p = exigir(await api('POST', `/atencion-enfermeria/pacientes/${carlos.id}/protocolos`, { token: enf, body: { motivoIngreso: 'respiratorio' } }), [201], 'Iniciar protocolo');
    for (const t of p.tareas.slice(0, 2)) await api('PATCH', `/atencion-enfermeria/tareas/${t.id}/completar`, { token: enf });
    creados++;
    console.log('  Fernández: protocolo respiratorio con 2 de 6 tareas hechas');
  }
  const protJorge = exigir(await api('GET', `/atencion-enfermeria/pacientes/${jorge.id}/protocolos`, { token: enf }), [200], 'Protocolos');
  if (!protJorge.length) {
    exigir(await api('POST', `/atencion-enfermeria/pacientes/${jorge.id}/protocolos`, { token: med, body: { motivoIngreso: 'pre_operatorio' } }), [201], 'Iniciar protocolo');
    creados++;
    console.log('  Díaz: protocolo pre-operatorio');
  }

  // Indicaciones: las de María (prepaga) se cumplen y se facturan solas.
  const facturasMaria = exigir(await api('GET', `/facturacion/pacientes/${maria.id}/facturas`, { token: A }), [200], 'Facturas');
  if (!facturasMaria.length) {
    const indicar = (paciente, body) => api('POST', `/atencion-enfermeria/pacientes/${paciente.id}/indicaciones`, { token: med, body });
    const i1 = exigir(await indicar(maria, { tipo: 'medicacion', descripcion: 'Paracetamol 1 g cada 8 horas', insumoId: paracetamol.id, cantidad: 2 }), [201], 'Indicación');
    const i2 = exigir(await indicar(maria, { tipo: 'medicacion', descripcion: 'Hidratación con suero', insumoId: suero.id, cantidad: 1 }), [201], 'Indicación');
    exigir(await api('PATCH', `/atencion-enfermeria/indicaciones/${i1.id}/cumplir`, { token: enf }), [200], 'Cumplir indicación');
    exigir(await api('PATCH', `/atencion-enfermeria/indicaciones/${i2.id}/cumplir`, { token: enf }), [200], 'Cumplir indicación');
    // Pendientes para que enfermería tenga algo que hacer en la vista.
    await indicar(carlos, { tipo: 'medicacion', descripcion: 'Paracetamol 1 g si fiebre', insumoId: paracetamol.id, cantidad: 1 });
    await indicar(carlos, { tipo: 'estudio', descripcion: 'Radiografía de tórax' });
    await indicar(jorge, { tipo: 'dieta', descripcion: 'Ayuno desde las 22 h' });
    creados += 5;
    console.log('  María: 2 medicaciones cumplidas (facturadas); Fernández y Díaz: 3 indicaciones pendientes');
  } else existentes++;

  // 11. Facturación: cargos manuales y una factura cerrada
  paso('Facturación');
  // El evento de medicación se procesa en segundo plano: se espera un momento antes de leer las facturas.
  await new Promise((r) => setTimeout(r, 800));
  const facturasJuan = exigir(await api('GET', `/facturacion/pacientes/${juan.id}/facturas`, { token: A }), [200], 'Facturas');
  if (!facturasJuan.length) {
    const f = exigir(await api('POST', `/facturacion/pacientes/${juan.id}/cargos`, { token: A, body: { concepto: 'Consulta de control', cantidad: 1, precioUnitario: '15000.00' } }), [201], 'Cargo manual');
    await api('POST', `/facturacion/pacientes/${juan.id}/cargos`, { token: A, body: { concepto: 'Laboratorio de rutina', cantidad: 1, precioUnitario: '22000.00' } });
    await api('PATCH', `/facturacion/facturas/${f.id}/emitir`, { token: A });
    await api('PATCH', `/facturacion/facturas/${f.id}/pagar`, { token: A });
    creados++;
    console.log('  Gómez (particular): factura de $37.000 emitida y pagada');
  } else existentes++;
  const facturasCarlos = exigir(await api('GET', `/facturacion/pacientes/${carlos.id}/facturas`, { token: A }), [200], 'Facturas');
  if (!facturasCarlos.length) {
    await api('POST', `/facturacion/pacientes/${carlos.id}/cargos`, { token: A, body: { concepto: 'Día de internación en terapia', cantidad: 2, precioUnitario: '180000.00' } });
    creados++;
    console.log('  Fernández (pública): factura pendiente cubierta al 100%');
  } else existentes++;
  const fm = exigir(await api('GET', `/facturacion/pacientes/${maria.id}/facturas`, { token: A }), [200], 'Facturas');
  if (fm.length) console.log(`  López (prepaga 70%): paga ${fm[0].total}, cubre ${fm[0].montoCubierto}`);

  // ---------- resumen ----------
  console.log(`\nListo: ${creados} cosas nuevas, ${existentes} ya existían.`);
  for (const a of avisos) console.log(`  Aviso: ${a}`);
  console.log('\nUsuarios para entrar al frontend o a Swagger:');
  console.log(`  admin         ${ADMIN.email} / (la de tu .env)`);
  for (const u of USUARIOS) console.log(`  ${u.rol.padEnd(14)}${u.email} / ${u.password}`);
  console.log(`  paciente      ${PACIENTE_USUARIO.email} / ${PACIENTE_USUARIO.password}`);
}

main().catch((e) => {
  console.error(`\nError: ${e.message}`);
  process.exit(1);
});
