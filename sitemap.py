import requests
from xml.etree.ElementTree import Element, SubElement, tostring
import os

links = [
    {"url": "/", "changefreq": "daily", "priority": 1.0},
    {"url": "/resultados", "changefreq": "weekly", "priority": 0.8},
    {"url": "/dicionario", "changefreq": "weekly", "priority": 0.8},
    {"url": "/pos-graduacao", "changefreq": "monthly", "priority": 0.7},
    {"url": "/grupos-pesquisa", "changefreq": "monthly", "priority": 0.7},
    {"url": "/informacoes", "changefreq": "monthly", "priority": 0.7},
    {"url": "/indicadores", "changefreq": "monthly", "priority": 0.7},
    {"url": "/producoes-recentes", "changefreq": "weekly", "priority": 0.8},
    {"url": "/departamentos", "changefreq": "monthly", "priority": 0.7},
    {"url": "/researcher", "changefreq": "daily", "priority": 1.0},
    {"url": "/resultados-ia", "changefreq": "daily", "priority": 0.9},
    {"url": "/paines-dados-externos", "changefreq": "monthly", "priority": 0.6},
    {"url": "/indice-pesquisador", "changefreq": "monthly", "priority": 0.7},
    {"url": "/relatar-problema", "changefreq": "monthly", "priority": 0.5},
    {"url": "/pesquisadores-selecionados", "changefreq": "monthly", "priority": 0.6},
    {"url": "/provimento-cargo", "changefreq": "monthly", "priority": 0.6},
    {"url": "/listagens", "changefreq": "monthly", "priority": 0.6},
    {"url": "/termos-uso", "changefreq": "yearly", "priority": 0.5},
    {"url": "/sobre", "changefreq": "yearly", "priority": 0.5},
    {"url": "/ufmg", "changefreq": "monthly", "priority": 0.5},
    {"url": "/signIn", "changefreq": "monthly", "priority": 0.5},
    {"url": "/signUp", "changefreq": "monthly", "priority": 0.5},
    {"url": "/recoverPassword", "changefreq": "monthly", "priority": 0.5},
    {"url": "/updatePassword", "changefreq": "monthly", "priority": 0.5},
    {"url": "/dashboard/administrativo", "changefreq": "monthly", "priority": 0.7},
    {"url": "/dashboard", "changefreq": "monthly", "priority": 0.7},
    {"url": "/dashboard/parametros-pesquisa", "changefreq": "monthly", "priority": 0.7},
    {"url": "/dashboard/secao-pessoal", "changefreq": "monthly", "priority": 0.7},
    {"url": "/dashboard/relatar-problema", "changefreq": "monthly", "priority": 0.5},
    {"url": "/dashboard/pesquisadores-selecionados", "changefreq": "monthly", "priority": 0.6},
    {"url": "/dashboard/programas", "changefreq": "monthly", "priority": 0.7},
    {"url": "/dashboard/departamentos", "changefreq": "monthly", "priority": 0.7},
    {"url": "/dashboard/pesquisadores", "changefreq": "monthly", "priority": 0.7},
    {"url": "/dashboard/inct", "changefreq": "monthly", "priority": 0.6},
    {"url": "/dashboard/pesos-avaliacao", "changefreq": "monthly", "priority": 0.6},
    {"url": "/dashboard/minhas-producoes", "changefreq": "monthly", "priority": 0.6},
    {"url": "/dashboard/grupos-pesquisa", "changefreq": "monthly", "priority": 0.6},
    {"url": "/dashboard/indicadores", "changefreq": "monthly", "priority": 0.6},
    {"url": "/dashboard/baremas", "changefreq": "monthly", "priority": 0.6},
    {"url": "/dashboard/enviar-notificacoes", "changefreq": "monthly", "priority": 0.5},
]

def generate_sitemap():
    try:
        # Endpoint da API
        url_term_pesquisadores = "https://conectee.eng.ufmg.br/api/researcherName?name="

        # Requisição à API ignorando o SSL
        response = requests.get(url_term_pesquisadores, verify=False)
        response.raise_for_status()

        # Processar dados retornados
        data = response.json()
        if data:
            for props in data:
                links.append({
                    "url": f"/researcher?researcher_name={props['name']}&search_type=&terms=",
                    "changefreq": "daily",
                    "priority": 1.0
                })

        # Criar o elemento do sitemap
        urlset = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
        for link in links:
            url_element = SubElement(urlset, "url")
            loc = SubElement(url_element, "loc")
            loc.text = f"https://conectee.eng.ufmg.br{link['url']}"
            changefreq = SubElement(url_element, "changefreq")
            changefreq.text = link["changefreq"]
            priority = SubElement(url_element, "priority")
            priority.text = str(link["priority"])

        # Converter o XML para string
        sitemap_xml = tostring(urlset, encoding="utf-8", method="xml")

        # Salvar o sitemap em um arquivo
        os.makedirs("./public", exist_ok=True)
        with open("./public/sitemap.xml", "wb") as file:
            file.write(sitemap_xml)

        print("Sitemap criado com sucesso!")
    except requests.RequestException as e:
        print("Erro ao acessar a API:", e)
    except Exception as e:
        print("Erro ao gerar o sitemap:", e)

if __name__ == "__main__":
    generate_sitemap()
