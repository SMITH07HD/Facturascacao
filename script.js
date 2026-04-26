// ============================================================
//  CONFIGURACIÓN SUPABASE — pon tus datos aquí
// ============================================================
const SUPABASE_URL = 'https://zzceekbjjyrhnqpyguem.supabase.co';   // ej: https://abcdef.supabase.co
const SUPABASE_KEY = 'sb_publishable_548xsorZjwbxU2QxoDOoFA_P_B0VrSX';        // clave pública (anon/public)

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
const TAX_RATE = 0.06625;
let carrito  = [];
let productos = [];
let categoriaActual = null;

// ============================================================
//  BASE DE DATOS — PRODUCTOS
// ============================================================
async function cargarProductosDB() {
    mostrarCargando(true);

    const { data, error } = await db
        .from('productos')
        .select('*')
        .order('categoria');

    mostrarCargando(false);

    if (error) {
        console.error('Error cargando productos:', error);
        alert('❌ No se pudo conectar a la base de datos.\nRevisa tu URL y clave de Supabase.');
        return;
    }

    productos = data;
    cargarProductos();
}

async function agregarProductoDB(producto) {
    const { data, error } = await db
        .from('productos')
        .insert([producto])
        .select()
        .single();

    if (error) {
        console.error(error);
        alert('❌ Error al guardar el producto');
        return null;
    }
    return data;
}

async function actualizarProductoDB(id, cambios) {
    const { error } = await db
        .from('productos')
        .update(cambios)
        .eq('id', id);

    if (error) {
        console.error(error);
        alert('❌ Error al actualizar el producto');
        return false;
    }
    return true;
}

async function eliminarProductoDB(id) {
    const { error } = await db
        .from('productos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(error);
        alert('❌ Error al eliminar el producto');
        return false;
    }
    return true;
}

// ============================================================
//  BASE DE DATOS — VENTAS
// ============================================================
async function guardarVentaDB(venta) {
    const { error } = await db.from('ventas').insert([venta]);
    if (error) console.error('Error guardando venta:', error);
}

async function cargarVentasDB() {
    const { data, error } = await db
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) {
        alert('❌ Error cargando ventas');
        return [];
    }
    return data;
}

async function eliminarVentaDB(id) {
    const { error } = await db
        .from('ventas')
        .delete()
        .eq('id', id);

    if (error) alert('❌ Error eliminando venta');
}

// ============================================================
//  UI HELPER — PANTALLA DE CARGA
// ============================================================
function mostrarCargando(visible) {
    let el = document.getElementById('cargando');
    if (el) el.style.display = visible ? 'flex' : 'none';
}

// ============================================================
//  CARRITO
// ============================================================
function agregarProducto(id) {
    let producto = productos.find(p => p.id === id);
    if (!producto) return;

    let existente = carrito.find(p => p.nombre === producto.nombre);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            nombre:   producto.nombre,
            precio:   producto.precio,
            cantidad: 1
        });
    }

    mostrarCarrito();
}

function aumentarCantidad(index) {
    carrito[index].cantidad++;
    mostrarCarrito();
}

function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }
    mostrarCarrito();
}

function quitarDelCarrito(index) {
    carrito.splice(index, 1);
    mostrarCarrito();
}

function mostrarCarrito() {
    let lista = document.getElementById('lista');
    let subtotalGeneral = 0;

    lista.innerHTML = '';

    carrito.forEach((producto, index) => {
        let subtotal = producto.precio * producto.cantidad;
        subtotalGeneral += subtotal;

        let li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <strong>${producto.nombre}</strong><br>
            $${producto.precio} x ${producto.cantidad} = <strong>$${subtotal.toFixed(2)}</strong>
            <br>
            <div class="btn-group btn-group-sm mt-1">
                <button class="btn btn-outline-success" onclick="aumentarCantidad(${index})">+</button>
                <button class="btn btn-outline-secondary" onclick="disminuirCantidad(${index})">−</button>
                <button class="btn btn-outline-danger" onclick="quitarDelCarrito(${index})">✕</button>
            </div>
        `;
        lista.appendChild(li);
    });

    let tax   = subtotalGeneral * TAX_RATE;
    let total = subtotalGeneral + tax;

    document.getElementById('total').innerHTML = `
        Subtotal: $${subtotalGeneral.toFixed(2)}<br>
        Tax (6.625%): $${tax.toFixed(2)}<br>
        <strong>Total: $${total.toFixed(2)}</strong>
    `;

    window.totalFinal = total;
}

// ============================================================
//  PANTALLA — CATEGORÍAS
// ============================================================
function cargarProductos() {
    categoriaActual = null;
    let contenedor = document.getElementById('productos');
    contenedor.innerHTML = '';

    let categorias = [
        { id: 'yaroas',    nombre: '🍟 Yaroas',              img: 'https://static.wixstatic.com/media/ca5c65_060997d8bfb648ffb07ac2bb492a9cda~mv2.png/v1/fill/w_1536,h_1024,al_c/ChatGPT%20Image%2021%20ene%202026%2C%2002_21_23%20p.m..png' },
        { id: 'chimis',    nombre: '🌭 Chimis & Sandwiches', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349' },
        { id: 'empanadas', nombre: '🥟 Empanadas',           img: 'https://www.tasteofhome.com/wp-content/uploads/2026/02/Mini-Chicken-Empanadas_EXPS_TOHVP25_47080_MF_09_24_1.jpg' },
        { id: 'bebidas',   nombre: '🥤 Batidas & Jugos',     img: 'https://hiraoka.com.pe/media/mageplaza/blog/post/j/u/juegos_y_batidos_saludables_nutritivos-hiraoka.jpg' }
    ];

    categorias.forEach(cat => {
        let div = document.createElement('div');
        div.className = 'col-md-6 mb-4';
        div.innerHTML = `
            <div class="card categoria-card text-center shadow-lg"
                 onclick="mostrarCategoria('${cat.id}')">
                <img src="${cat.img}" class="categoria-img">
                <div class="card-body">
                    <h2 class="fw-bold">${cat.nombre}</h2>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

// ============================================================
//  PANTALLA — PRODUCTOS POR CATEGORÍA
// ============================================================
function mostrarCategoria(categoria) {
    categoriaActual = categoria;
    let contenedor = document.getElementById('productos');
    contenedor.innerHTML = '';

    // Botón volver
    let volver = document.createElement('button');
    volver.className = 'btn btn-light mb-3';
    volver.innerText = '⬅ Volver a categorías';
    volver.addEventListener('click', () => cargarProductos());
    contenedor.appendChild(volver);

    // Título
    let titulo = document.createElement('h2');
    titulo.className = 'text-white mb-3 text-center';
    titulo.innerText = 'Categoría: ' + categoria.toUpperCase();
    contenedor.appendChild(titulo);

    // Grid de productos
    let row = document.createElement('div');
    row.className = 'row';

    let filtrados = productos.filter(p => p.categoria === categoria);

    if (filtrados.length === 0) {
        row.innerHTML = `<p class="text-white text-center">No hay productos en esta categoría todavía.</p>`;
    }

    filtrados.forEach(p => {
        let div = document.createElement('div');
        div.className = 'col-md-4 mb-4';
        div.innerHTML = `
<div class="card producto-card shadow">
    <img src="${p.img}" class="card-img-top producto-img"
         onerror="this.src='https://via.placeholder.com/300?text=Sin+imagen'">
    <div class="card-body text-center">
        <h5>${p.nombre}</h5>
        <p class="precio">$${p.precio}</p>
        <button class="btn btn-success w-100 mb-2"
            onclick="agregarProducto('${p.id}')">➕ Agregar</button>
        <button class="btn btn-warning w-100 mb-2"
            onclick="editarProducto('${p.id}')">✏️ Editar</button>
        <button class="btn btn-danger w-100"
            onclick="eliminarProducto('${p.id}')">🗑 Eliminar</button>
    </div>
</div>`;
        row.appendChild(div);
    });

    contenedor.appendChild(row);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
//  CRUD — AGREGAR PRODUCTO NUEVO
// ============================================================
async function agregarNuevoProducto() {
    let nombre    = document.getElementById('nuevoNombre').value.trim();
    let precio    = parseFloat(document.getElementById('nuevoPrecio').value);
    let categoria = document.getElementById('nuevaCategoria').value;
    let urlImagen = document.getElementById('nuevaImagen').value.trim();
    let archivo   = document.getElementById('imagenArchivo').files[0];

    if (!nombre || isNaN(precio) || precio <= 0) {
        alert('⚠️ Completa el nombre y un precio válido');
        return;
    }

    const guardar = async (img) => {
        let nuevo = { nombre, precio, categoria, img };
        let guardado = await agregarProductoDB(nuevo);
        if (guardado) {
            productos.push(guardado);
            alert('✅ Producto agregado correctamente');
            // Limpiar formulario
            document.getElementById('nuevoNombre').value   = '';
            document.getElementById('nuevoPrecio').value   = '';
            document.getElementById('nuevaImagen').value   = '';
            document.getElementById('imagenArchivo').value = '';
            cargarProductos();
        }
    };

    if (archivo) {
        let reader = new FileReader();
        reader.onload = (e) => guardar(e.target.result);
        reader.readAsDataURL(archivo);
    } else {
        guardar(urlImagen || 'https://via.placeholder.com/300?text=Producto');
    }
}

// ============================================================
//  CRUD — EDITAR PRODUCTO
// ============================================================
async function editarProducto(id) {
    let p = productos.find(x => x.id === id);
    if (!p) return;

    let nuevoNombre = prompt('Nuevo nombre:', p.nombre);
    if (nuevoNombre === null) return; // canceló

    let nuevoPrecio = prompt('Nuevo precio:', p.precio);
    if (nuevoPrecio === null) return; // canceló

    if (!nuevoNombre.trim() || isNaN(nuevoPrecio) || parseFloat(nuevoPrecio) <= 0) {
        alert('⚠️ Datos inválidos');
        return;
    }

    let cambios = {
        nombre: nuevoNombre.trim(),
        precio: parseFloat(nuevoPrecio)
    };

    let ok = await actualizarProductoDB(id, cambios);

    if (ok) {
        // Actualizar en el array local también
        p.nombre = cambios.nombre;
        p.precio = cambios.precio;
        mostrarCategoria(p.categoria);
    }
}

// ============================================================
//  CRUD — ELIMINAR PRODUCTO
// ============================================================
async function eliminarProducto(id) {
    let p = productos.find(x => x.id === id);
    if (!p) return;

    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;

    let ok = await eliminarProductoDB(id);
    if (ok) {
        productos = productos.filter(x => x.id !== id);
        if (categoriaActual) {
            mostrarCategoria(categoriaActual);
        } else {
            cargarProductos();
        }
    }
}

// ============================================================
//  FACTURA — IMPRIMIR
// ============================================================
async function imprimir() {
    let cliente   = document.getElementById('cliente').value.trim();
    let telefono  = document.getElementById('telefono').value.trim();
    let direccion = document.getElementById('direccion').value.trim();

    if (!cliente || !telefono || !direccion) {
        alert('⚠️ Completa todos los datos del cliente');
        return;
    }
    if (carrito.length === 0) {
        alert('⚠️ El carrito está vacío');
        return;
    }

    // ✅ Obtiene la URL absoluta del logo directamente del DOM
    let imgEl    = document.querySelector('img[src="logo.png"]');
    let logoSrc  = imgEl ? new URL('logo.png', window.location.href).href : '';
    let logoHTML = logoSrc
        ? `<img src="${logoSrc}" style="max-width:180px;display:block;margin:0 auto 12px;">`
        : `<h1 style="text-align:center">☕ CACAO</h1>`;

    let subtotal  = 0;
    let itemsHTML = '';

    carrito.forEach(p => {
        let itemTotal = p.precio * p.cantidad;
        subtotal += itemTotal;
        itemsHTML += `
            <div class="producto">
                <span>${p.nombre} x${p.cantidad}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>`;
    });

    let tax   = subtotal * TAX_RATE;
    let total = subtotal + tax;

    let contenido = `
    <html><head><title>Factura - CACAO</title>
    <style>
        body{font-family:Arial;background:#f5f5f5;padding:20px;}
        .factura{background:white;max-width:400px;margin:auto;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2);}
        h2{text-align:center;}
        .seccion{margin-top:15px;}
        .datos p{margin:3px 0;font-size:14px;}
        .producto{display:flex;justify-content:space-between;font-size:14px;margin:5px 0;}
        .total{font-size:18px;font-weight:bold;text-align:center;margin-top:10px;}
        .redes{text-align:center;margin-top:15px;}
    </style></head><body>
    <div class="factura">
        ${logoHTML}
        <div class="seccion datos">
           <h2>Datos del Cliente</h2>
<p><strong>Nombre:</strong> ${cliente}</p>
<p><strong>Teléfono:</strong> ${telefono}</p>
<p><strong>Dirección:</strong> ${direccion}</p>
<p><strong>📅 Fecha:</strong> ${new Date().toLocaleDateString('es-DO', {day:'2-digit', month:'long', year:'numeric'})}</p>
<p><strong>🕒 Hora:</strong> ${new Date().toLocaleTimeString('es-DO', {hour:'2-digit', minute:'2-digit', hour12:true})}</p>
        </div>
        <hr>
        <div class="seccion">
            <h2>📦 Pedido</h2>
            ${itemsHTML}
            <hr>
            <div class="total">
                <div style="display:flex;justify-content:space-between;">
                    <span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                    <span>Tax (6.625%):</span><span>$${tax.toFixed(2)}</span>
                </div>
                <hr>
                <div style="display:flex;justify-content:space-between;font-size:20px;">
                    <span>TOTAL:</span><span>$${total.toFixed(2)}</span>
                </div>
            </div>
            <div class="redes">
                <h3>📲 Síguenos</h3>
                <p>👍 Facebook: Cacao Picaderas</p>
                <p>📸 Instagram: @Cacaopicaderasyantojitos</p>
                <p>💬 WhatsApp: (609) 453-5988</p>
                <p>💬 WhatsApp: (609) 908-1260</p>
            </div>
        </div>
    </div></body></html>`;

    let ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.print();

    guardarVentaDB({
        cliente,
        telefono,
        direccion,
        fecha:     new Date().toISOString(),
        productos: JSON.stringify(carrito),
        total
    });
}
// ============================================================
//  HISTORIAL DE VENTAS
// ============================================================
async function verHistorial() {
    let ventas = await cargarVentasDB();

    if (ventas.length === 0) {
        alert('No hay ventas registradas todavía');
        return;
    }

    const esMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esMobile) {
        mostrarHistorialMobile(ventas);
    } else {
        mostrarHistorialDesktop(ventas);
    }
}

// ============================================================
//  HISTORIAL — VERSIÓN MOBILE (overlay en la misma página)
// ============================================================
function mostrarHistorialMobile(ventas) {
    // Eliminar overlay anterior si existe
    let anterior = document.getElementById('historial-overlay');
    if (anterior) anterior.remove();

    let filas = ventas.map(v => `
        <div class="hm-card" data-id="${v.id}">
            <div class="hm-card-top">
                <div>
                    <div class="hm-cliente">👤 ${v.cliente}</div>
                    <div class="hm-fecha">🕒 ${new Date(v.fecha).toLocaleString('es-DO')}</div>
                </div>
                <div class="hm-total">$${parseFloat(v.total).toFixed(2)}</div>
            </div>
            <div class="hm-info">
                📞 ${v.telefono || 'N/A'} · 📍 ${v.direccion}
            </div>
            <div class="hm-btns">
                <button class="hm-btn hm-btn-detail" onclick="abrirDetallesMobile('${v.id}')">📋 Detalles</button>
                <button class="hm-btn hm-btn-delete" onclick="borrarVentaMobile('${v.id}', this)">🗑 Eliminar</button>
            </div>
        </div>`).join('');

    let ventasJSON = JSON.stringify(ventas).replace(/</g, '\\u003c');

    document.body.insertAdjacentHTML('beforeend', `
    <div id="historial-overlay" style="
        position:fixed;inset:0;z-index:9999;
        background:#0f172a;color:white;
        font-family:'Segoe UI',sans-serif;
        display:flex;flex-direction:column;overflow:hidden;">

        <!-- HEADER -->
        <div style="display:flex;align-items:center;justify-content:space-between;
            padding:16px 20px;background:#1e293b;
            font-size:17px;font-weight:700;
            border-bottom:1px solid #334155;flex-shrink:0;">
            <button onclick="document.getElementById('historial-overlay').remove()"
                style="background:none;border:none;color:white;font-size:28px;cursor:pointer;padding:0 12px 0 0;">‹</button>
            <span>📊 Historial de Ventas</span>
            <span style="background:#3b82f6;color:white;font-size:13px;
                font-weight:700;padding:3px 10px;border-radius:20px;">
                ${ventas.length}
            </span>
        </div>

        <!-- LISTA -->
        <div style="flex:1;overflow-y:auto;padding:14px 14px 120px;-webkit-overflow-scrolling:touch;">
            ${filas}
        </div>

        <!-- BOTTOM SHEET FONDO -->
        <div id="hm-bg" onclick="cerrarSheetMobile()"
            style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;"></div>

        <!-- BOTTOM SHEET -->
        <div id="hm-sheet" style="
            position:fixed;bottom:0;left:0;right:0;
            background:#1e293b;border-radius:20px 20px 0 0;
            padding:16px 20px 40px;z-index:10001;
            transform:translateY(100%);
            transition:transform .3s cubic-bezier(.32,.72,0,1);
            max-height:80vh;overflow-y:auto;">
            <div style="width:40px;height:4px;background:#475569;border-radius:4px;margin:0 auto 20px;"></div>
            <div id="hm-sheet-titulo" style="font-size:17px;font-weight:700;padding-bottom:14px;border-bottom:1px solid #334155;margin-bottom:14px;"></div>
            <div id="hm-sheet-items"></div>
            <div id="hm-sheet-totales" style="margin-top:16px;background:#0f172a;border-radius:10px;padding:14px;"></div>
            <button onclick="cerrarSheetMobile()"
                style="margin-top:20px;width:100%;background:#334155;color:white;
                border:none;padding:14px;border-radius:12px;
                font-size:16px;font-weight:700;cursor:pointer;">
                ✕ Cerrar
            </button>
        </div>
    </div>

    <style>
        .hm-card{background:#1e293b;border-radius:14px;padding:16px;margin-bottom:12px;
            box-shadow:0 2px 12px rgba(0,0,0,0.35);border-left:4px solid #3b82f6;}
        .hm-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
        .hm-cliente{font-size:16px;font-weight:700;}
        .hm-fecha{font-size:12px;opacity:.55;margin-top:3px;}
        .hm-total{background:#22c55e;color:white;font-weight:800;font-size:15px;
            padding:6px 12px;border-radius:10px;white-space:nowrap;}
        .hm-info{font-size:13px;opacity:.7;margin-bottom:12px;line-height:1.6;}
        .hm-btns{display:flex;gap:8px;}
        .hm-btn{flex:1;padding:12px 0;border:none;border-radius:10px;
            font-size:14px;font-weight:700;cursor:pointer;}
        .hm-btn:active{opacity:.8;transform:scale(0.97);}
        .hm-btn-detail{background:#3b82f6;color:white;}
        .hm-btn-delete{background:#ef4444;color:white;}
        .hm-item-fila{display:flex;justify-content:space-between;align-items:center;
            padding:11px 0;border-bottom:1px solid #334155;font-size:15px;}
        .hm-item-fila:last-child{border-bottom:none;}
        .hm-item-precio{color:#22c55e;font-weight:700;}
        .hm-total-fila{display:flex;justify-content:space-between;font-size:14px;padding:5px 0;opacity:.8;}
        .hm-total-fila.grande{font-size:18px;font-weight:800;color:#22c55e;opacity:1;
            padding-top:10px;margin-top:6px;border-top:1px solid #334155;}
    </style>

    <script>
        const _VENTAS_MOBILE = ${ventasJSON};

        function abrirDetallesMobile(id) {
            let venta = _VENTAS_MOBILE.find(v => String(v.id) === String(id));
            if (!venta) return;

            let items = [];
            try {
                let raw = venta.productos;
                if (typeof raw === 'string') raw = JSON.parse(raw);
                if (typeof raw === 'string') raw = JSON.parse(raw);
                items = Array.isArray(raw) ? raw : [];
            } catch(e) { items = []; }

            let subtotal = 0;
            let filasHTML = items.length === 0
                ? '<p style="text-align:center;opacity:.5;padding:20px 0">Sin detalle</p>'
                : items.map(item => {
                    let linea = parseFloat(item.precio) * parseInt(item.cantidad);
                    subtotal += linea;
                    return '<div class="hm-item-fila">' +
                        '<span>' + item.nombre + ' <span style="opacity:.5;font-size:12px">x' + item.cantidad + '</span></span>' +
                        '<span class="hm-item-precio">$' + linea.toFixed(2) + '</span>' +
                    '</div>';
                  }).join('');

            let tax   = subtotal * 0.06625;
            let total = subtotal + tax;

            document.getElementById('hm-sheet-titulo').innerText = '📋 Pedido de ' + venta.cliente;
            document.getElementById('hm-sheet-items').innerHTML  = filasHTML;
            document.getElementById('hm-sheet-totales').innerHTML =
                '<div class="hm-total-fila"><span>Subtotal</span><span>$' + subtotal.toFixed(2) + '</span></div>' +
                '<div class="hm-total-fila"><span>Tax 6.625%</span><span>$' + tax.toFixed(2) + '</span></div>' +
                '<div class="hm-total-fila grande"><span>TOTAL</span><span>$' + total.toFixed(2) + '</span></div>';

            document.getElementById('hm-bg').style.display = 'block';
            setTimeout(() => {
                document.getElementById('hm-sheet').style.transform = 'translateY(0)';
            }, 10);
        }

        function cerrarSheetMobile() {
            document.getElementById('hm-sheet').style.transform = 'translateY(100%)';
            document.getElementById('hm-bg').style.display = 'none';
        }

        async function borrarVentaMobile(id, btn) {
            if (!confirm('¿Eliminar esta venta?')) return;
            const { createClient } = supabase;
            const _db = createClient('${SUPABASE_URL}', '${SUPABASE_KEY}');
            const { error } = await _db.from('ventas').delete().eq('id', id);
            if (error) { alert('❌ Error eliminando'); return; }
            let card = btn.closest('.hm-card');
            card.style.transition = 'opacity .3s, transform .3s';
            card.style.opacity    = '0';
            card.style.transform  = 'translateX(60px)';
            setTimeout(() => card.remove(), 300);
        }
    <\/script>`);
}

// ============================================================
//  HISTORIAL — VERSIÓN DESKTOP (popup igual que antes)
// ============================================================
function mostrarHistorialDesktop(ventas) {
    let filas = ventas.map(v => `
        <div class="venta-card">
            <div class="venta-header">
                <span>👤 ${v.cliente}</span>
                <span class="badge-total">$${parseFloat(v.total).toFixed(2)}</span>
            </div>
            <div class="info">
                📞 ${v.telefono || 'N/A'}<br>
                📍 ${v.direccion}<br>
                🕒 ${new Date(v.fecha).toLocaleString('es-DO')}
            </div>
            <div class="btns">
                <button class="btn-custom btn-detail" onclick="verDetalles('${v.id}')">📋 Detalles</button>
                <button class="btn-custom btn-delete" onclick="borrarVenta('${v.id}', this)">🗑 Eliminar</button>
            </div>
        </div>`).join('');

    let ventasJSON = JSON.stringify(ventas);

    let contenido = `
    <html><head><title>Historial de Ventas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
    <style>
        body{background:#0f172a;color:white;font-family:Arial;padding:20px;}
        h1{text-align:center;margin-bottom:20px;}
        .venta-card{background:#1e293b;border-radius:12px;padding:15px;margin-bottom:15px;box-shadow:0 4px 10px rgba(0,0,0,0.4);}
        .venta-header{display:flex;justify-content:space-between;font-weight:bold;margin-bottom:10px;}
        .badge-total{background:#22c55e;padding:5px 10px;border-radius:8px;}
        .btns{margin-top:10px;display:flex;gap:8px;}
        .btn-custom{border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold;}
        .btn-delete{background:#ef4444;color:white;}
        .btn-detail{background:#3b82f6;color:white;}
        .info{font-size:14px;opacity:.9;line-height:1.8;}
        .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;align-items:center;justify-content:center;}
        .modal-overlay.activo{display:flex;}
        .modal-box{background:#1e293b;border-radius:16px;padding:24px;width:90%;max-width:480px;}
        .modal-titulo{font-size:18px;font-weight:bold;margin-bottom:16px;border-bottom:1px solid #334155;padding-bottom:10px;}
        .item-fila{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #334155;}
        .item-precio{color:#22c55e;font-weight:bold;}
        .modal-linea{display:flex;justify-content:space-between;margin-top:10px;padding-top:8px;}
        .modal-linea.grande{font-size:19px;font-weight:bold;color:#22c55e;border-top:2px solid #475569;margin-top:12px;padding-top:12px;}
        .btn-cerrar{margin-top:18px;width:100%;background:#475569;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:bold;}
    </style>
    <script>
        const { createClient } = supabase;
        const _db = createClient('${SUPABASE_URL}', '${SUPABASE_KEY}');
        const VENTAS_DATA = ${ventasJSON};

        async function borrarVenta(id, btn) {
            if (!confirm('¿Eliminar esta venta?')) return;
            const { error } = await _db.from('ventas').delete().eq('id', id);
            if (error) { alert('❌ Error eliminando'); return; }
            btn.closest('.venta-card').remove();
        }

        function verDetalles(id) {
            let venta = VENTAS_DATA.find(v => String(v.id) === String(id));
            if (!venta) return;
            let items = [];
            try {
                let raw = venta.productos;
                if (typeof raw === 'string') raw = JSON.parse(raw);
                if (typeof raw === 'string') raw = JSON.parse(raw);
                items = Array.isArray(raw) ? raw : [];
            } catch(e) { items = []; }

            let subtotal = 0;
            let filasHTML = items.length === 0
                ? '<p style="opacity:.5;text-align:center">Sin detalle</p>'
                : items.map(item => {
                    let linea = parseFloat(item.precio) * parseInt(item.cantidad);
                    subtotal += linea;
                    return '<div class="item-fila"><span>' + item.nombre + ' <span style="opacity:.5">x' + item.cantidad + '</span></span><span class="item-precio">$' + linea.toFixed(2) + '</span></div>';
                  }).join('');

            let tax = subtotal * 0.06625;
            document.getElementById('modal-titulo').innerText   = '📋 Pedido de ' + venta.cliente;
            document.getElementById('modal-items').innerHTML    = filasHTML;
            document.getElementById('modal-subtotal').innerText = '$' + subtotal.toFixed(2);
            document.getElementById('modal-tax').innerText      = '$' + tax.toFixed(2);
            document.getElementById('modal-total').innerText    = '$' + (subtotal + tax).toFixed(2);
            document.getElementById('modal').classList.add('activo');
        }

        function cerrarModal() { document.getElementById('modal').classList.remove('activo'); }
        document.addEventListener('click', e => { if (e.target === document.getElementById('modal')) cerrarModal(); });
    <\/script>
    </head><body>
    <h1>📊 Historial de Ventas</h1>
    ${filas}
    <div class="modal-overlay" id="modal">
        <div class="modal-box">
            <div class="modal-titulo" id="modal-titulo"></div>
            <div id="modal-items"></div>
            <div class="modal-linea"><span>Subtotal:</span><span id="modal-subtotal"></span></div>
            <div class="modal-linea" style="opacity:.7;font-size:14px"><span>Tax (6.625%):</span><span id="modal-tax"></span></div>
            <div class="modal-linea grande"><span>TOTAL:</span><span id="modal-total"></span></div>
            <button class="btn-cerrar" onclick="cerrarModal()">✕ Cerrar</button>
        </div>
    </div>
    </body></html>`;

    let ventana = window.open('', '', 'width=900,height=700');
    ventana.document.write(contenido);
    ventana.document.close();
}

// ============================================================
//  INICIAR APLICACIÓN
// ============================================================
cargarProductosDB();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}


// ============================================================
//  TOGGLE FORMULARIO AGREGAR PRODUCTO
// ============================================================
let formularioAbierto = false;

function toggleFormulario() {
    let body   = document.getElementById('formulario-body');
    let flecha = document.getElementById('flecha-formulario');

    formularioAbierto = !formularioAbierto;

    if (formularioAbierto) {
        body.style.maxHeight = '600px';
        flecha.style.transform = 'rotate(180deg)';
    } else {
        body.style.maxHeight = '0';
        flecha.style.transform = 'rotate(0deg)';
    }
}


// ============================================================
//  BOTÓN FLOTANTE — AGREGAR PRODUCTO MOBILE
// ============================================================

// Mostrar FAB solo en mobile
if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.getElementById('fab-agregar').style.display = 'flex';
    document.getElementById('fab-agregar').style.alignItems = 'center';
    document.getElementById('fab-agregar').style.justifyContent = 'center';
}

function abrirFormularioMobile() {
    document.getElementById('fab-bg').style.display    = 'block';
    setTimeout(() => {
        document.getElementById('fab-sheet').style.transform = 'translateY(0)';
    }, 10);
}

function cerrarFormularioMobile() {
    document.getElementById('fab-sheet').style.transform = 'translateY(100%)';
    document.getElementById('fab-bg').style.display = 'none';
}

async function agregarNuevoProductoMobile() {
    let nombre    = document.getElementById('nuevoNombre2').value.trim();
    let precio    = parseFloat(document.getElementById('nuevoPrecio2').value);
    let categoria = document.getElementById('nuevaCategoria2').value;
    let urlImagen = document.getElementById('nuevaImagen2').value.trim();
    let archivo   = document.getElementById('imagenArchivo2').files[0];

    if (!nombre || isNaN(precio) || precio <= 0) {
        alert('⚠️ Completa el nombre y un precio válido');
        return;
    }

    const guardar = async (img) => {
        let nuevo    = { nombre, precio, categoria, img };
        let guardado = await agregarProductoDB(nuevo);
        if (guardado) {
            productos.push(guardado);
            alert('✅ Producto agregado');
            // Limpiar campos
            document.getElementById('nuevoNombre2').value    = '';
            document.getElementById('nuevoPrecio2').value    = '';
            document.getElementById('nuevaImagen2').value    = '';
            document.getElementById('imagenArchivo2').value  = '';
            cerrarFormularioMobile();
            cargarProductos();
        }
    };

    if (archivo) {
        let reader    = new FileReader();
        reader.onload = (e) => guardar(e.target.result);
        reader.readAsDataURL(archivo);
    } else {
        guardar(urlImagen || 'https://via.placeholder.com/300?text=Producto');
    }
}