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
function imprimir() {
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body{font-family:Arial;background:#f5f5f5;padding:20px;}
        .factura{background:white;max-width:400px;margin:auto;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2);}
        h1,h2{text-align:center;}
        .seccion{margin-top:15px;}
        .datos p{margin:3px 0;font-size:14px;}
        .producto{display:flex;justify-content:space-between;font-size:14px;margin:5px 0;}
        .total{font-size:18px;font-weight:bold;text-align:center;margin-top:10px;}
        .redes{text-align:center;margin-top:15px;}
    </style></head><body>
    <div class="factura">
        <h1>☕ CACAO</h1>
        <div class="seccion datos">
            <h2>Datos del Cliente</h2>
            <p><strong>Nombre:</strong> ${cliente}</p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
            <p><strong>Dirección:</strong> ${direccion}</p>
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

    // Guardar venta en Supabase
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
                <button class="btn-custom btn-detail"
                    onclick="verDetalles('${v.id}')">
                    📋 Detalles
                </button>
                <button class="btn-custom btn-delete"
                    onclick="borrarVenta('${v.id}', this)">
                    🗑 Eliminar
                </button>
            </div>
        </div>`).join('');

    // ✅ Serializamos todas las ventas una sola vez, sin trucos de escaping
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
        /* MODAL */
        .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;align-items:center;justify-content:center;}
        .modal-overlay.activo{display:flex;}
        .modal-box{background:#1e293b;border-radius:16px;padding:24px;width:90%;max-width:480px;box-shadow:0 8px 30px rgba(0,0,0,0.6);}
        .modal-titulo{font-size:18px;font-weight:bold;margin-bottom:16px;border-bottom:1px solid #334155;padding-bottom:10px;}
        .item-fila{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #334155;font-size:15px;}
        .item-fila:last-child{border-bottom:none;}
        .item-precio{color:#22c55e;font-weight:bold;}
        .modal-linea{display:flex;justify-content:space-between;margin-top:10px;padding-top:8px;}
        .modal-linea.grande{font-size:19px;font-weight:bold;color:#22c55e;border-top:2px solid #475569;margin-top:12px;padding-top:12px;}
        .btn-cerrar{margin-top:18px;width:100%;background:#475569;color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:15px;}
        .btn-cerrar:hover{background:#64748b;}
    </style>
    <script>
        const { createClient } = supabase;
        const _db = createClient('${SUPABASE_URL}', '${SUPABASE_KEY}');

        // ✅ Todas las ventas disponibles en el popup, sin pasar nada por onclick
        const VENTAS_DATA = ${ventasJSON};

        /* ---- BORRAR VENTA ---- */
        async function borrarVenta(id, btn) {
            if (!confirm('¿Eliminar esta venta?')) return;
            const { error } = await _db.from('ventas').delete().eq('id', id);
            if (error) { alert('❌ Error eliminando'); return; }
            btn.closest('.venta-card').remove();
            alert('✅ Venta eliminada');
        }

        /* ---- VER DETALLES ---- */
        function verDetalles(id) {
            // Buscar la venta por ID dentro de los datos ya cargados
            let venta = VENTAS_DATA.find(v => String(v.id) === String(id));
            if (!venta) { alert('No se encontró la venta'); return; }

            let items = [];
            try {
                let raw = venta.productos;
                // Puede venir como string JSON o ya como array (Supabase a veces parsea)
                if (typeof raw === 'string') raw = JSON.parse(raw);
                items = Array.isArray(raw) ? raw : [];
            } catch(e) {
                console.error('Error parseando productos:', e);
                items = [];
            }

            let subtotal   = 0;
            let filasHTML  = '';

            if (items.length === 0) {
                filasHTML = '<p style="opacity:.6;text-align:center;padding:20px 0;">Sin detalle de productos</p>';
            } else {
                items.forEach(item => {
                    let linea = parseFloat(item.precio) * parseInt(item.cantidad);
                    subtotal += linea;
                    filasHTML += \`
                        <div class="item-fila">
                            <span>\${item.nombre} <span style="opacity:.5;font-size:13px;">x\${item.cantidad}</span></span>
                            <span class="item-precio">$\${linea.toFixed(2)}</span>
                        </div>\`;
                });
            }

            let tax   = subtotal * 0.06625;
            let total = subtotal + tax;

            document.getElementById('modal-titulo').innerText   = '📋 Pedido de ' + venta.cliente;
            document.getElementById('modal-items').innerHTML    = filasHTML;
            document.getElementById('modal-subtotal').innerText = '$' + subtotal.toFixed(2);
            document.getElementById('modal-tax').innerText      = '$' + tax.toFixed(2);
            document.getElementById('modal-total').innerText    = '$' + total.toFixed(2);
            document.getElementById('modal').classList.add('activo');
        }

        function cerrarModal() {
            document.getElementById('modal').classList.remove('activo');
        }

        document.addEventListener('click', function(e) {
            if (e.target === document.getElementById('modal')) cerrarModal();
        });
    <\/script>
    </head><body>

    <h1>📊 Historial de Ventas</h1>
    ${filas}

    <!-- MODAL -->
    <div class="modal-overlay" id="modal">
        <div class="modal-box">
            <div class="modal-titulo" id="modal-titulo"></div>
            <div id="modal-items"></div>
            <div class="modal-linea">
                <span>Subtotal:</span><span id="modal-subtotal"></span>
            </div>
            <div class="modal-linea" style="opacity:.7;font-size:14px;">
                <span>Tax (6.625%):</span><span id="modal-tax"></span>
            </div>
            <div class="modal-linea grande">
                <span>TOTAL:</span><span id="modal-total"></span>
            </div>
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