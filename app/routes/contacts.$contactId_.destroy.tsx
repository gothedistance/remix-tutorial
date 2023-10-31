import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteContact } from "~/data";


export const action = async ({ params }: ActionFunctionArgs) => { 
    invariant(params.contactId, "contactId is required")
    await deleteContact(params.contactId)
    return redirect("/")
}