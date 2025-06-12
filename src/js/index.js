let animales = [];
    let currentPhotoData = null;

    // Cargar datos al iniciar
    document.addEventListener('DOMContentLoaded', function() {
        cargarAnimales();
        actualizarEstadisticas();

        // Establecer fecha actual por defecto
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fechaEntrada').value = hoy;
    });

    // Manejar envío del formulario
    document.getElementById('animalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        agregarAnimal();
    });

    function tomarFoto() {
        document.getElementById('fotoInput').click();
    }

    function previewPhoto() {
        const input = document.getElementById('fotoInput');
        const preview = document.getElementById('photoPreview');

        if (input.files && input.files[0]) {
            const reader = new FileReader();

            reader.onload = function(e) {
                currentPhotoData = e.target.result;
                preview.src = currentPhotoData;
                preview.style.display = 'block';
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    function agregarAnimal() {
        const formData = new FormData(document.getElementById('animalForm'));

        const animal = {
            id: Date.now(),
            nombre: formData.get('nombre'),
            tipo: formData.get('tipo'),
            raza: formData.get('raza') || 'No especificada',
            peso: formData.get('peso') || 'No especificado',
            fechaNacimiento: formData.get('fechaNacimiento') || 'No especificada',
            fechaEntrada: formData.get('fechaEntrada'),
            fechaVenta: formData.get('fechaVenta') || 'No especificada',
            estado: formData.get('estado'),
            notas: formData.get('notas') || 'Sin notas',
            foto: currentPhotoData,
            fechaRegistro: new Date().toLocaleDateString('es-ES')
        };

        animales.push(animal);
        guardarAnimales();
        mostrarAnimales();
        actualizarEstadisticas();

        // Limpiar formulario
        document.getElementById('animalForm').reset();
        document.getElementById('photoPreview').style.display = 'none';
        currentPhotoData = null;

        // Establecer fecha actual por defecto nuevamente
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fechaEntrada').value = hoy;

        // Mostrar mensaje de éxito
        mostrarMensaje('Animal registrado correctamente', 'success');
    }

    function mostrarAnimales(animalesFiltrados = null) {
        const grid = document.getElementById('animalsGrid');
        const animalesAMostrar = animalesFiltrados || animales;

        if (animalesAMostrar.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.1em; padding: 40px;">No hay animales registrados</p>';
            return;
        }

        grid.innerHTML = animalesAMostrar.map(animal => {
            const diasEnGranja = calcularDias(animal.fechaEntrada);
            const edadMeses = animal.fechaNacimiento !== 'No especificada' ?
                calcularMeses(animal.fechaNacimiento) : 'No especificada';

            return `
                <div class="animal-card">
                    <div class="status-badge status-${animal.estado.toLowerCase()}">${animal.estado}</div>
                    <div class="animal-photo">
                        ${animal.foto ?
                            `<img src="${animal.foto}" style="width: 100%; height: 100%; object-fit: cover;">` :
                            getAnimalEmoji(animal.tipo)
                        }
                    </div>
                    <div class="animal-info">
                        <div class="animal-name">${animal.nombre}</div>
                        <div class="animal-detail">
                            <span><strong>Tipo:</strong></span>
                            <span>${animal.tipo}</span>
                        </div>
                        <div class="animal-detail">
                            <span><strong>Raza:</strong></span>
                            <span>${animal.raza}</span>
                        </div>
                        <div class="animal-detail">
                            <span><strong>Peso:</strong></span>
                            <span>${animal.peso} kg</span>
                        </div>
                        <div class="animal-detail">
                            <span><strong>Edad:</strong></span>
                            <span>${edadMeses} meses</span>
                        </div>
                        <div class="animal-detail">
                            <span><strong>En granja:</strong></span>
                            <span>${diasEnGranja} días</span>
                        </div>
                        <div class="animal-detail">
                            <span><strong>Venta prevista:</strong></span>
                            <span>${animal.fechaVenta}</span>
                        </div>
                        ${animal.notas !== 'Sin notas' ?
                            `<div class="animal-detail" style="grid-column: 1/-1; margin-top: 10px;">
                                <strong>Notas:</strong> ${animal.notas}
                            </div>` : ''
                        }
                        <button class="delete-btn" onclick="eliminarAnimal(${animal.id})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function getAnimalEmoji(tipo) {
        const emojis = {
            'Vaca': '🐄',
            'Pato': '🦆',
            'Oveja': '🐑',
            'Cabra': '🐐',
            'Pollo': '🐔',
            'Pavo': '🦃',
            'Caballo': '🐴',
            'Otro': '🐾'
        };
        return emojis[tipo] || '🐾';
    }

    function calcularDias(fechaInicio) {
        const inicio = new Date(fechaInicio);
        const hoy = new Date();
        const diferencia = hoy - inicio;
        return Math.floor(diferencia / (1000 * 60 * 60 * 24));
    }

    function calcularMeses(fechaNacimiento) {
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();
        const meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());
        return Math.max(0, meses);
    }

    function eliminarAnimal(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este animal?')) {
            animales = animales.filter(animal => animal.id !== id);
            guardarAnimales();
            mostrarAnimales();
            actualizarEstadisticas();
            mostrarMensaje('Animal eliminado correctamente', 'warning');
        }
    }

    function filtrarAnimales() {
        const busqueda = document.getElementById('searchInput').value.toLowerCase();
        const tipoFiltro = document.getElementById('filterTipo').value;
        const estadoFiltro = document.getElementById('filterEstado').value;

        const animalesFiltrados = animales.filter(animal => {
            const coincideNombre = animal.nombre.toLowerCase().includes(busqueda);
            const coincideTipo = !tipoFiltro || animal.tipo === tipoFiltro;
            const coincideEstado = !estadoFiltro || animal.estado === estadoFiltro;

            return coincideNombre && coincideTipo && coincideEstado;
        });

        mostrarAnimales(animalesFiltrados);
    }

    function actualizarEstadisticas() {
        const total = animales.length;
        const activos = animales.filter(a => a.estado === 'Activo').length;

        // Calcular próximas ventas (animales con fecha de venta en los próximos 30 días)
        const hoy = new Date();
        const enTreintaDias = new Date();
        enTreintaDias.setDate(hoy.getDate() + 30);

        const proximasVentas = animales.filter(animal => {
            if (animal.fechaVenta === 'No especificada' || animal.estado !== 'Activo') return false;
            const fechaVenta = new Date(animal.fechaVenta);
            return fechaVenta >= hoy && fechaVenta <= enTreintaDias;
        }).length;

        document.getElementById('totalAnimales').textContent = total;
        document.getElementById('animalesActivos').textContent = activos;
        document.getElementById('proximasVentas').textContent = proximasVentas;
    }

    function guardarAnimales() {
        // Simulamos guardado en memoria durante la sesión
        // En una aplicación real, aquí se guardaría en una base de datos
    }

    function cargarAnimales() {
        // Los datos se mantienen en memoria durante la sesión
        mostrarAnimales();
    }

    function mostrarMensaje(mensaje, tipo) {
        // Crear elemento de mensaje
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;

        if (tipo === 'success') {
            msgDiv.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        } else if (tipo === 'warning') {
            msgDiv.style.background = 'linear-gradient(135deg, #FF9800, #f57c00)';
        }

        msgDiv.textContent = mensaje;
        document.body.appendChild(msgDiv);

        // Remover después de 3 segundos
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(msgDiv);
            }, 300);
        }, 3000);
    }

    // Agregar CSS para animaciones de mensajes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);