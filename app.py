from flask import Flask, render_template, request, redirect, url_for
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

app = Flask(__name__)
app.secret_key = "hym_secret_key_web"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.context_processor
def inject_supabase_config():
    return dict(supabase_url=SUPABASE_URL, supabase_key=SUPABASE_KEY)

@app.route('/')
def home():
    try:
        response = supabase.table('propiedades').select('*, imagenes(url)').order('created_at', desc=True).limit(6).execute()
        propiedades = response.data
    except Exception as e:
        print(f"Error en home: {e}")
        propiedades = []
    return render_template('index.html', propiedades=propiedades)

@app.route('/propiedad/<int:id>')
def detalle(id):
    try:
        response = supabase.table('propiedades').select('*, imagenes(url)').eq('id', id).single().execute()
        propiedad = response.data
    except Exception:
        return redirect(url_for('home'))
    return render_template('detalle.html', p=propiedad)

@app.route('/catalogo')
def catalogo():
    tipo = request.args.get('tipo')
    estado = request.args.get('estado')
    
    try:
        # DEBUG: Ver todas las propiedades primero
        print("\n=== DEBUG: MOSTRANDO TODAS LAS PROPIEDADES ===")
        all_props = supabase.table('propiedades').select('*').execute()
        print(f"Total propiedades en BD: {len(all_props.data)}")
        
        if all_props.data and len(all_props.data) > 0:
            print("\nColumnas disponibles:", list(all_props.data[0].keys()))
            print("\nDatos de cada propiedad:")
            for p in all_props.data:
                print(f"  ID:{p.get('id')} | tipo='{p.get('tipo')}' | estado='{p.get('estado')}'")
        print("=" * 70)
        
        # Iniciar query con filtros
        query = supabase.table('propiedades').select('*, imagenes(url)')
        
        if tipo and tipo.strip():
            # Usar ilike para búsqueda insensible a mayúsculas
            query = query.ilike('tipo', tipo)
            print(f"\nFiltrando por tipo (ilike): '{tipo}'")
            
        if estado and estado.strip():
            # Usar ilike para búsqueda insensible a mayúsculas
            query = query.ilike('estado', estado)
            print(f"Filtrando por estado (ilike): '{estado}'")
        
        response = query.execute()
        propiedades = response.data
        
        print(f"\nTotal propiedades encontradas: {len(propiedades)}\n")
        
    except Exception as e:
        print(f"ERROR al filtrar propiedades: {e}")
        propiedades = []
        
    return render_template('index.html', propiedades=propiedades, filtro_activo=True)

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)