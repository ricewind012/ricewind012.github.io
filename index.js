const k_reURL = /(https?:\/\/[\w.-]+\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const k_strBaseURL = "https://raw.githubusercontent.com/ricewind012/ricewind012.github.io/refs/heads/master";

const k_vecSomeFuckingImages = [
	"https://raw.githubusercontent.com/ricewind012/aerothemesteam/refs/heads/master/assets/preview/main-window.png",
];

const k_vecThemes = [
	"life",
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

function SetPageImageURL()
{
	const strImage = RandomArrayElement( k_vecSomeFuckingImages );
	els.pageImage.style.setProperty( "--bg-url", `url( "${ strImage }" )` );
}

const ThemeStore =
{
	m_elStyle: (() => {
		const el = document.createElement( "style" );
		document.head.appendChild( el );
		return el;
	})(),

	/**
	 * @param {string} strTheme
	 */
	async Change( strTheme )
	{
		const strURL = `${ k_strBaseURL }/themes/${ strTheme }.css`;
		const strContent = await ExtResourcesTracker.FetchText( strURL );
		// No false positives, I know I will use the links :-)
		for ( const _ of strContent.match( k_reURL ) ?? [] ) {
			ExtResourcesTracker.Add();
			console.error( _ );
		}
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
		els.extResInfo.dataset.count = this.m_unExternalResources.toString();
	},

	/**
	 * @param {string} strURL
	 */
	Fetch( strURL )
	{
		this.Add();
		return fetch( strURL );
	},

	/**
	 * @param {string} strURL
	 */
	async FetchText( strURL )
	{
		// for NetworkError
		const result = await this.Fetch( strURL ).catch( (e) => `Got error for ${ strURL }: ${ e.message }` );
		if ( typeof result === "string" )
		{
			return result;
		}

		if ( !result.ok )
		{
			return `${ strURL } returned "${ await result.text() }"`;
		}

		const strContent = await result.text();
		if ( !strContent )
		{
			return "empty text";
		}

		return strContent;
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
				if ( len === 1 )
				{
					const strTitle = line.slice( len + 1 );
					document.title = strTitle;
					els.pageTitle.textContent = strTitle;
					continue;
				}

				this.AddLine( `<${ strTag }> ${ line.slice( len ) } </${ strTag }>`, true );
				continue;
			}

			if ( line.startsWith( "```" ) )
			{
				if ( line === "```" )
				{
					strParentTag = "";
					this.AddLine( "</pre>" );
				}
				else
				{
					strParentTag = "pre";
					this.AddLine( "<pre>" );
				}
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
			this.AddLine( strParentTag ? strText : `<p> ${ strText } </p>`, true );
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

	async WriteText()
	{
		const strContent = await this.GetText();
		this.ParseText( strContent );
		this.setHTML( this.m_lines.join( "\n" ) );
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
		extResInfo: q( "footer-ext-res-info" ),
		footerChangeImageBtn: id( "change-image" ),
		footerChangeThemeBtn: id( "change-theme" ),
		markdownRenderer: q( "markdown-renderer" ),
		pageImage: q( "page-image" ),
		pageTitle: q( "page-title" ),
	};

	els.markdownRenderer.SetFromURL( location.href );
	navigation.addEventListener( "navigate", ( ev ) => {
		const { url } = ev.destination;
		els.markdownRenderer.SetFromURL( url );
	} );

	const strTheme = RandomArrayElement( k_vecThemes );
	ThemeStore.Change( strTheme );
	els.footerChangeThemeBtn.addEventListener( "click", () => {
		const strTheme = RandomArrayElement( k_vecThemes );
		ThemeStore.Change( strTheme );
	} );

	SetPageImageURL();
	els.footerChangeImageBtn.addEventListener( "click", () => {
		SetPageImageURL();
	} );
} );
