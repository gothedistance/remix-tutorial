import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";

import invariant from "tiny-invariant";
import type { ContactRecord } from "../data";
import { getContact, updateContact } from "../data";

// Loader
export const loader = async ({ params }: LoaderFunctionArgs) => {
    //値がtrueの場合は何もせず、falseの場合は第二引数に渡した値をエラーメッセージとした例外が発生するようになっている
    //params.contactIdが取れない＝Remixのファイルルーティング設定に誤りがある
    invariant(params.contactId, "Missing contactId param");
    const contact = await getContact(params.contactId);
    if (!contact) {
      throw new Response("Not Found", { status: 404 });
    }    return json({contact})
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
    const formData = await request.formData();
    return updateContact(params.contactId, {
        favorite: formData.get("favorite") === "true",
    });
}
export default function Contact() {
    const { contact } = useLoaderData<typeof loader>();

    return (
        <div id="contact">
            <div>
                <img
                    alt={`${contact.first} ${contact.last} avatar`}
                    key={contact.avatar}
                    src={contact.avatar} />                
            </div>
            <div>
                <h1>
                    {contact.first || contact.last ? (
                        <>
                            {contact.first} {contact.last}
                        </>
                    ) : (
                            <i>No Name</i>
                    )}{" "}
                    <Favorite contact={contact}/>
                </h1>
                {contact.twitter ? (
                <p>
                    <a href={`https://twitter.com/${contact.twitter}`}>
                        @{contact.twitter}
                    </a>
                </p>
                ) : null}

                {contact.notes ? <p>{contact.notes}</p> : null}
                <div>
                    {/* edit_.tsxで、actionを公開すると自動的に紐付けられる。かっこいいよおおお */}
                    <Form action="edit">
                        <button type="submit">Edit</button>
                    </Form>
                    {/* confirmでキャンセルした場合は、preventしないとPOSTしちゃうよね */}
                    <Form action="destroy" method="post" onSubmit={(event) => {
                        const response = confirm("Are you sure you want to delete this contact?");
                        if(!response) {
                            event.preventDefault();
                        }
                    }}>
                        <button type="submit">Delete</button>
                    </Form>
                </div>
            </div>
        </div>
    )
}

const Favorite: FunctionComponent<{ contact: Pick<ContactRecord, "favorite"> }> = ({ contact }) => {
    const fetcher = useFetcher();
    const favorite = fetcher.formData 
        ? fetcher.formData.get("favorite") === "true"
        : contact.favorite;

    return (
        <fetcher.Form method="post">
            <button aria-label={
                favorite ? "Remove from favorites" : "Add to favorites"
            } name="favorite" value={favorite ? "false" : "true"}>
            {favorite ? "★" : "☆"}
            </button>
        </fetcher.Form>
    )

}