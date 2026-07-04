const k_reURL = /(https?:\/\/[\w.-]+\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const k_strBaseURL = "https://raw.githubusercontent.com/ricewind012/ricewind012.github.io/refs/heads/master";
const k_vecThemes = [
	"default",
];

/**
 * @template T
 * @param {T} vec
 * @returns {T}
 */
function RandomArrayElement( vec )
{
	return vec[ Math.floor( Math.random() * vec.length ) ];
}

const ThemeStore =
{
	m_elStyle: document.head.querySelector( "style" ),

	/**
	 * @param {string} strTheme
	 */
	async Change( strTheme )
	{
		const strContent = ExtResourcesTracker.FetchText( `${ k_strBaseURL }/themes/${ strTheme }.css` );
		this.m_elStyle.textContent = strContent;
	},
}

const ExtResourcesTracker =
{
	// <link> in the html
	m_unExternalResources: 1,

	Add()
	{
		this.m_unExternalResources++;
	},

	/**
	 * @param {string} strURL
	 */
	Fetch ( strURL )
	{
		this.Add();
		els.extResInfo.dataset.count = this.m_unExternalResources.toString();
		return fetch( strURL );
	},

	/**
	 * @param {string} strURL
	 */
	async FetchText( strURL )
	{
		const result = await this.Fetch( strURL );
		if ( !result.ok )
		{
			return `${ strURL } returned "${ await result.text() }"`;
		}

		const strContent = await result.text();
		if ( !strContent )
		{
			return "empty text";
		}
	}
}

class CBaseCustomElement extends HTMLElement
{
	/**
	 * Take a guess
	 * @param {string} strTag
	 * @param {Record< string, string >} attrs
	 */
	CreateElement( strTag, attrs )
	{
		const el = document.createElement( strTag );
		for ( const [ k, v ] of attrs )
		{
			el.setAttribute( k, v );
		}
		this.appendChild( el );

		return el;
	}
}

class CMarkdownRendererElement extends CBaseCustomElement
{
	static observedAttributes = [ "file-name" ];

	/** @type {string[]} */
	m_lines = [];

	/**
	 * @param {string} strText
	 * @param {boolean} bNeedsParsing
	 */
	AddLine( strText, bNeedsParsing = false )
	{
		if ( !bNeedsParsing )
		{
			this.m_lines.push( strText );
			return;
		}

		const strParsed = strText.replace( k_reURL, "<a href='$1'> $1 </a>" );
		this.m_lines.push( strParsed );
	}

	async GetText()
	{
		const strFileName = this.getAttribute( "file-name" );
		return ExtResourcesTracker.FetchText( `${ k_strBaseURL }/things/${ strFileName }.md` );
	}

	/**
	 * @param {string} strText
	 */
	ParseText( strText )
	{
		let strParentTag = "";
		for ( const line of strText.split( "\n" ) )
		{
			if ( line.startsWith( "#" ) )
			{
				const len = line.match( /^#+/g ).length;
				const strTag = `h${ len }`
				this.AddLine( `<${ strTag }> ${ line.slice( len ) } </${ strTag }>`, true );
				if ( len === 1 )
				{
					const strTitle = line.slice( len + 1 );
					document.title = strTitle;
					els.pageTitle.textContent = strTitle;
				}
				continue;
			}

			if ( line.startsWith( "```" ) )
			{
				this.AddLine( line === "```" ? "</pre>" : "<pre>" );
				continue;
			}

			if ( line.startsWith( "- " ) )
			{
				if ( strParentTag !== "ul" )
				{
					strParentTag = "ul";
					this.AddLine( "<ul>" );
				}
				this.AddLine( `<li> ${ line.slice( 2 ) } </li>`, true );
				continue;
			}

			if ( line === "" )
			{
				if ( strParentTag !== "" )
				{
					this.AddLine( `</${ strParentTag }>` );
					strParentTag = "";
				}
				continue;
			}

			// text
			const strText = line.replace( /`(.*?)`/g, "<code> $1 </code>" );
			this.AddLine( strText, true );
		}
	}

	/**
	 * @param {string} strURL
	 */
	SetFromURL( strURL )
	{
		const hash = strURL.slice( strURL.indexOf( "#" ) + 1 );
		this.setAttribute( "file-name", hash );
	}

	/**
	 * @param {string} strName
	 */
	async attributeChangedCallback( strName )
	{
		switch ( strName )
		{
			case "file-name":
				await this.WriteText();
				break;
		}
	}

	async WriteText()
	{
		const strContent = await this.GetText();
		this.ParseText( strContent );
		this.setHTMLUnsafe( this.m_lines.join( "\n" ) );
	}

	async connectedCallback()
	{
		if ( !this.getAttribute( "file-name" ) )
		{
			return;
		}

		await this.WriteText();
	}
}
customElements.define( "markdown-renderer", CMarkdownRendererElement );

let els = {};

document.addEventListener( "DOMContentLoaded", () => {
	const id = (sel) => document.getElementById( sel );
	const q = (sel) => document.querySelector( sel );

	els = {
		changeThemeBtn: id( "change-theme" ),
		extResInfo: id( "footer-ext-res-info" ),
		markdownRenderer: q( "markdown-renderer" ),
		pageTitle: id( "page-title" ),
	};

	els.markdownRenderer.SetFromURL( location.href );
	navigation.addEventListener( "navigate", ( ev ) => {
		const { url } = ev.destination;
		els.markdownRenderer.SetFromURL( url );
	} );

	els.changeThemeBtn.addEventListener( "click", () => {
		const strTheme = RandomArrayElement( k_vecThemes );
		ThemeStore.Change( strTheme );
	} );
} );
