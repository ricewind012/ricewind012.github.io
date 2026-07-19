const k_reURL = /(https?:\/\/[\w.-]+\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const k_strBaseURL = location.hostname === "firefox.localhost"
	? "https://firefox.localhost"
	: "https://raw.githubusercontent.com/ricewind012/ricewind012.github.io/refs/heads/master";

const k_vecSomeFuckingImages = [
	"https://raw.githubusercontent.com/ricewind012/aerothemesteam/refs/heads/master/assets/preview/main-window.png",
	"https://raw.githubusercontent.com/anitabi/image-merge/refs/heads/master/7eyih3xg.jpg",
	"https://raw.githubusercontent.com/itorr/one-last-image/refs/heads/main/simple.jpg",
	RandomArrayElement( [
		"https://raw.githubusercontent.com/itorr/sakana/refs/heads/main/html/chisato.png",
		"https://raw.githubusercontent.com/itorr/sakana/refs/heads/main/html/takina.png",
	] ),
];

const k_vecThemes = [
	"life",
];

/**
 * @param {string} strText 
 */
function EscapeHTML( strText )
{
	return strText
		.replaceAll( "&", "&amp;" )
		.replaceAll( "<", "&lt;" )
		.replaceAll( ">", "&gt;" )
		.replaceAll( '"', "&quot;" )
		.replaceAll( "'", "&#39;" );
}

/**
 * @template T
 * @param {T} vec
 * @returns {T}
 */
function RandomArrayElement( vec )
{
	return vec[ Math.floor( Math.random() * vec.length ) ];
}

function SetIndexPageTitle()
{
	const stop_looking_at_my_code =
		window
		[ "globalThis" ]
		[ "oZNcuyVwmAVhSberYZztjw".replace( /[oZcyVwAVhSYZztjw]/g, "" ) ]
		[
			[
				0x53d + 0x1 * 0x2207 + 0x26f7 * -0x1,
				-0x1361 + 0x1 * 0x24d7 + -0x5 * 0x371,
				0xf6e + -0x119c + 0x286 * 0x1,
				0x5 * 0x648 + 0xb69 + -0x1539 * 0x2,
				0x15d6 + 0x10e2 + -0x2665,
				0x2 * -0xd0a + 0x826 + -0x85 * -0x23,
				0x319 * -0xb + -0xef2 + 0x314b,
				0x5 * -0x455 + 0x1 * 0x1eb6 + -0x8c8,
				-0x1 * -0x2507 + 0x722 + 0x76 * -0x5f,
				-0x2 * 0x9fa + -0x1 * -0xd70 + 0x6cd,
				0x5f9 + -0x2 * -0x796 + -0x14d7,
				0x1042 + -0x1 * 0x18d9 + -0x2f9 * -0x3,
				-0x256 * -0x7 + -0xcd8 + -0x33d,
				-0x1cc5 + -0x1 * -0x1e05 + -0x53 * 0x3,
				0x1b91 * -0x1 + 0x5b * -0x1b + 0x256f,
				0x5 * 0x5d1 + -0xdef + 0x49 * -0x34,
			].map( (e) => String.fromCharCode( e ) ).join( "" )
		]
		- ( 0x1036d776c00001 + -0x1ff07fbd7fffff + 0xfb9a846bffffe + 0x159143df5 * 0x17bd4f );
	document.title = Array.from(
		Array( stop_looking_at_my_code ),
		() => String.fromCharCode( Math.random().toString().slice( 2, 4 ) ),
	).join( "" );
}

function SetPageImageURL()
{
	// Workaround for Firefox, doesn't even parse
	if ( window.matchMedia( "( prefers-reduced-data )" ).matches )
	{
		return;
	}

	const k_strProp = "--bg-url";
	const strImage = RandomArrayElement( k_vecSomeFuckingImages );
	const strCurrentImage = els.pageImage.style.getPropertyValue( k_strProp );
	if ( strCurrentImage === `url( "${ strImage }" )` )
	{
		return;
	}

	ExtResourcesTracker.Add();
	els.pageImage.dataset.name =
		strImage.slice( strImage.lastIndexOf( "/" ) + 1, strImage.lastIndexOf( "." ) );
	els.pageImage.style.setProperty( k_strProp, `url( "${ strImage }" )` );
}

const ThemeStore =
{
	m_elStyle: (() => {
		const el = document.createElement( "style" );
		document.head.appendChild( el );
		return el;
	})(),
	m_strTheme: "",

	/**
	 * @param {string} strTheme
	 */
	async Change( strTheme )
	{
		if ( strTheme === this.m_strTheme )
		{
			return;
		}

		const strURL = `${ k_strBaseURL }/themes/${ strTheme }.css`;
		const strContent = await ExtResourcesTracker.FetchText( strURL );
		// No false positives, I know I will use the links :-)
		for ( const _ of strContent.match( k_reURL ) ?? [] ) {
			ExtResourcesTracker.Add();
			console.error( _ );
		}
		this.m_strTheme = strTheme;
		this.m_elStyle.textContent = strContent;
	},

	GetTheme()
	{
		return this.m_strTheme;
	},
};

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
		const result = await this.Fetch( strURL )
			.catch( (e) => `Got error for ${ strURL }: ${ e.message }` );
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
};

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

		const strParsed = strText
			.replace( /\[(.*?)\]\((.*?)\)/g, ( match, text, url ) => `<a href="${url}">${text}</a>` )
			.replace( k_reURL, ( match, ...args ) => {
				const offset = args.at( -2 );
				const full = args.at( -1 );
				const lastOpen = full.lastIndexOf( "<a ", offset );
				const lastClose = full.lastIndexOf( "</a>", offset );

				return lastOpen !== -1 && lastOpen > lastClose
					? match
					: `<a href="${match}">${match}</a>`;
			} );
		this.m_lines.push( strParsed );
	}

	async GetText()
	{
		const strFileName = this.getAttribute( "file-name" );
		const strURL = `${ k_strBaseURL }/things/${ strFileName }.md`;
		return ExtResourcesTracker.FetchText( strURL );
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
				const len = line.match( /^#+/g )[0].length;
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
					this.AddLine( `<pre data-lang="${ line.slice( 3 ) }"  data-test="123">` );
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
				if ( strParentTag === "pre" )
				{
					this.AddLine( line );
					continue;
				}

				if ( strParentTag !== "" )
				{
					this.AddLine( `</${ strParentTag }>` );
					strParentTag = "";
				}
				continue;
			}

			// normal text
			const ReplaceStuff = ( re, tag ) =>
				strText.replace( re, ( _, s ) => `<${ tag }> ${ EscapeHTML( s ) } </${ tag }>` );
			const strText = line
				.replace( /\*\*(.*?)\*\*/g, "<b> $1 </b>")
				.replace( /\s\*\b(.*?)\b\*\s/g, "<i> $1 </i>")
				.replace( /`(.*?)`/g, ( _, s ) => `<code> ${ EscapeHTML( s ) } </code>` );
			this.AddLine( strParentTag ? strText : `<p> ${ strText } </p>`, true );
		}
	}

	/**
	 * @param {string} strURL
	 */
	SetFromURL( strURL )
	{
		const hash = strURL.slice( strURL.indexOf( "#" ) + 1 );
		if ( !hash || hash === strURL )
		{
			return;
		}

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
customElements.define( "page-markdown", CMarkdownRendererElement );

let els = {};

document.addEventListener( "DOMContentLoaded", () => {
	const q = (sel) => document.querySelector( sel );
	els = {
		extResInfo: q( "page-footer-ext-res-info" ),
		footerChangeImageBtn: q( "page-footer-button[name='change-image']" ),
		footerChangeThemeBtn: q( "page-footer-button[name='change-theme']" ),
		markdownRenderer: q( "page-content > page-markdown" ),
		pageImage: q( "page-image" ),
		pageTitle: q( "page-title" ),
		pageWhat: q( "page-what > page-markdown" ),
	};

	SetIndexPageTitle();
	els.pageWhat.setAttribute( "file-name", "what" );

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
