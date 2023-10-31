import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit
} from "@remix-run/react";
import { useEffect } from "react";
import appStylesHref from "./app.css";
import { createEmptyContact, getContacts } from "./data";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// .<Form> prevents the browser from sending the request to the server
//and sends it to your route's action function instead with fetch.
export const action = async () => {
  const contact = await createEmptyContact()
  return json({ contact })
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")
  const contacts = await getContacts(q);
  // creating application/json responses
  return json({contacts, q})
}

export default function App() {
  //useLoaderData フックが返すデータの型が loader 関数の戻り値の型と同じであることを型推論で取得。
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
  navigation.location &&
  new URLSearchParams(navigation.location.search).has(
    "q"
  );

  // 検索して戻るボタンで戻った時、検索結果は正しいが入力値がキープされる
  // それを防ぐために、戻るボタンでURLが変更されたら、検索欄の値を同期する
  useEffect(() => {
    const searchField = document.getElementById("q")
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || ""
    }

  }, [q])
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>          
          <div>
            <Form id="search-form" role="search"
              onChange={(event) => { 
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch
                })
              }}>
              <input
                id="q"
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                placeholder="Search"
                type="search"
                defaultValue={q || ""}
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink to={`contacts/${contact.id}`}>
                      {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
  
                  </li>
                ))}
             </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div id="detail">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
