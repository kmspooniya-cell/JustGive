import {render,screen,fireEvent,waitFor} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {describe,it,expect,vi,afterEach} from "vitest";
import {MessageReportButton} from "../src/components/message-report-button";

afterEach(()=>vi.unstubAllGlobals());
describe("message report control",()=>{
  it("lets a visitor select a reason and sends a report",async()=>{
    const fetchMock=vi.fn().mockResolvedValue({ok:true});vi.stubGlobal("fetch",fetchMock);
    render(<MessageReportButton id="a1e72617-28b2-4be1-8aa2-32c0de3ca741" locale="en" label="Report"/>);
    fireEvent.click(screen.getByRole("button",{name:"Report"}));
    fireEvent.change(screen.getByLabelText("Reason for report"),{target:{value:"personal_information"}});
    fireEvent.click(screen.getByRole("button",{name:"Send report"}));
    await waitFor(()=>expect(screen.getByRole("status")).toHaveTextContent("Reported"));
    expect(fetchMock).toHaveBeenCalledWith("/api/messages/report",expect.objectContaining({method:"POST",body:JSON.stringify({id:"a1e72617-28b2-4be1-8aa2-32c0de3ca741",reason:"personal_information"})}));
  });
});
