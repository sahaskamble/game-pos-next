'use client';

import { request_variables } from "@/constants/whatsapp_automation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useWhatsappIntegration() {
  const [Messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMessages = async ({ page_size = '10', page_number = '1' } = {}) => {
    setLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", request_variables.access_token);
      myHeaders.append("Cookie", request_variables.cookie);

      // Construct query parameters
      const queryParams = new URLSearchParams({
        pageSize: page_size,
        pageNumber: page_number,
      });

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      // Append query parameters to URL
      const url = `${request_variables.api_endpoint}/api/v1/getMessages/${request_variables.contact}?${queryParams}`;

      const response = await fetch(url, requestOptions);
      const result = await response.json();
      console.log('Response', result);

      if (result?.result === 'success') {
        setMessages(result?.messages?.items);
      }
      toast.success('Messages Fetched');
    } catch (err) {
      toast.error(`Error fetching messages: ${err.message}`);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async ({ page_size = '10', page_number = '1' } = {}) => {
    setLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", request_variables.access_token);
      myHeaders.append("Cookie", request_variables.cookie);

      // Construct query parameters
      const queryParams = new URLSearchParams({
        pageSize: page_size,
        pageNumber: page_number,
      });

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      // Append query parameters to URL
      const url = `${request_variables.api_endpoint}/api/v1/getMessageTemplates/${request_variables.contact}?${queryParams}`;

      const response = await fetch(url, requestOptions);
      const result = await response.json();
      console.log('Response', result);

      if (result?.result === 'success') {
        setMessages(result?.messages?.items);
      }
      toast.success('Messages Fetched');
    } catch (err) {
      toast.error(`Error fetching messages: ${err.message}`);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const mutate = useCallback(async () => {
    await getMessages();
  }, []);

  useEffect(() => {
    if (request_variables?.cookie && request_variables?.access_token && request_variables?.api_endpoint) {
      getMessages({});
    }
  }, []);

  return {
    Messages,
    loading,
    getMessages,
    mutate,
  };
}
