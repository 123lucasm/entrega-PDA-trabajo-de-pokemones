// URL de la API para obtener Pokémon
const urlApi = 'https://pokeapi.co/api/v2/pokemon?limit=100';
// Recuperar la lista de favoritos del almacenamiento local o inicializar como vacío
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

// Evento que se dispara cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    obtenerPokemones(); // Llama a la función para obtener Pokémon

    // Agrega un evento al botón de búsqueda
    document.getElementById('boton-buscar').addEventListener('click', buscarPokemon);
});

// Función para obtener Pokémon de la API
function obtenerPokemones(url = urlApi) {
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => {
            mostrarPokemones(datos.results); // Muestra los Pokémon obtenidos
        });
}

// Función para mostrar los Pokémon en la interfaz
function mostrarPokemones(pokemones) {
    const listaPokemones = document.getElementById('lista-pokemones');
    listaPokemones.innerHTML = ''; // Limpia la lista actual

    // Obtén detalles de cada Pokémon y crea una lista ordenada por ID
    const promesas = pokemones.map(pokemon => 
        fetch(pokemon.url).then(respuesta => respuesta.json())
    );

    Promise.all(promesas).then(detallesPokemones => {
        // Ordena los Pokémon por ID
        detallesPokemones.sort((a, b) => a.id - b.id);

        // Muestra cada Pokémon ordenado
        detallesPokemones.forEach(detalles => {
            const tarjetaPokemon = crearTarjetaPokemon(detalles); // Crea tarjeta para cada Pokémon
            listaPokemones.appendChild(tarjetaPokemon); // Agrega la tarjeta a la lista
        });
    });
}

// Función para crear una tarjeta de Pokémon
function crearTarjetaPokemon(pokemon) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta-pokemon'); // Clase para estilos

    const imagen = document.createElement('img');
    imagen.src = pokemon.sprites.front_default; // URL de la imagen del Pokémon
    tarjeta.appendChild(imagen);

    const nombre = document.createElement('h3');
    nombre.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1); // Formatea el nombre
    tarjeta.appendChild(nombre);

    const contenedorBotones = document.createElement('div');
    contenedorBotones.classList.add('contenedor-botones');

    // Botón para mostrar información adicional del Pokémon
    const botonInfo = document.createElement('button');
    botonInfo.classList.add('boton-info');
    botonInfo.textContent = 'Info';
    botonInfo.addEventListener('click', () => mostrarDetalles(pokemon));

    // Botón para agregar o quitar de favoritos
    const botonFavorito = document.createElement('button');
    botonFavorito.classList.add('favorito');
    botonFavorito.textContent = favoritos.includes(pokemon.name) ? 'Favorito' : 'Agregar a Favoritos';
    botonFavorito.addEventListener('click', () => alternarFavorito(pokemon.name, botonFavorito));

    contenedorBotones.appendChild(botonInfo);
    contenedorBotones.appendChild(botonFavorito);

    tarjeta.appendChild(contenedorBotones);

    return tarjeta; // Devuelve la tarjeta creada
}

// Función para alternar Pokémon en la lista de favoritos
function alternarFavorito(nombrePokemon, boton) {
    if (favoritos.includes(nombrePokemon)) {
        favoritos = favoritos.filter(fav => fav !== nombrePokemon); // Elimina de favoritos
        boton.textContent = 'Agregar a Favoritos';
    } else {
        favoritos.push(nombrePokemon); // Agrega a favoritos
        boton.textContent = 'Favorito';
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos)); // Guarda en el almacenamiento local
}

// Función para mostrar detalles del Pokémon en un modal
function mostrarDetalles(pokemon) {
    const modal = document.getElementById('modal-pokemon');
    modal.style.display = 'flex'; // Muestra el modal

    // Actualiza el contenido del modal con detalles del Pokémon
    document.getElementById('nombre-pokemon').textContent = pokemon.name;
    document.getElementById('imagen-pokemon').src = pokemon.sprites.front_default;
    document.getElementById('base-experiencia').textContent = pokemon.base_experience;
    document.getElementById('altura-pokemon').textContent = `${pokemon.height / 10} m`;
    document.getElementById('peso-pokemon').textContent = `${pokemon.weight / 10} kg`;

    // Muestra los tipos de Pokémon
    const tiposContainer = document.getElementById('tipos-pokemon');
    tiposContainer.innerHTML = '';
    pokemon.types.forEach(typeInfo => {
        const tipoElement = document.createElement('span');
        tipoElement.classList.add('tipo', typeInfo.type.name);
        tipoElement.textContent = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
        tiposContainer.appendChild(tipoElement);
    });

    // Muestra las habilidades del Pokémon
    const habilidadesContainer = document.getElementById('habilidades-pokemon');
    habilidadesContainer.innerHTML = '';
    pokemon.abilities.forEach(abilityInfo => {
        const habilidadElement = document.createElement('span');
        habilidadElement.classList.add('habilidad');
        habilidadElement.textContent = abilityInfo.ability.name.charAt(0).toUpperCase() + abilityInfo.ability.name.slice(1);
        habilidadesContainer.appendChild(habilidadElement);
    });

    // Evento para cerrar el modal
    document.querySelector('.cerrar').addEventListener('click', () => {
        modal.style.display = 'none';
    });

}

// Función para buscar un Pokémon por nombre
function buscarPokemon() {
    const terminoBusqueda = document.getElementById('buscar').value.toLowerCase();
    const url = `https://pokeapi.co/api/v2/pokemon/${terminoBusqueda}`;

    if (terminoBusqueda) {
        fetch(url)
            .then(respuesta => {
                if (respuesta.ok) {
                    return respuesta.json(); // Retorna la respuesta en formato JSON
                } else {
                    throw new Error('No se encontró el Pokémon'); // Manejo de errores
                }
            })
            .then(data => {
                const listaPokemones = document.getElementById('lista-pokemones');
                listaPokemones.innerHTML = ''; // Limpia la lista antes de mostrar el resultado
                const tarjetaPokemon = crearTarjetaPokemon(data); // Crea tarjeta del Pokémon buscado
                listaPokemones.appendChild(tarjetaPokemon);

                document.getElementById('buscar').value = ''; // Limpia el campo de búsqueda
            })
            .catch(error => {
                alert(error.message); // Muestra mensaje de error
                console.error("Error:", error); // Registro del error en la consola
            });
    } else {
        obtenerPokemones(); // Si no hay término de búsqueda, obtiene todos los Pokémon
    }
}
