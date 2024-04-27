exports.template = `<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0;">
	<meta name="format-detection" content="telephone=no" />

	<!-- Responsive Mobile-First Email Template by Konstantin Savchenko, 2015.
	https://github.com/konsav/email-templates/  -->

	<style>
		/* Reset styles */
		body {
			margin: 0;
			padding: 0;
			min-width: 100%;
			width: 100% !important;
			height: 100% !important;
		}

		body,
		table,
		td,
		div,
		p,
		a {
			-webkit-font-smoothing: antialiased;
			text-size-adjust: 100%;
			-ms-text-size-adjust: 100%;
			-webkit-text-size-adjust: 100%;
			line-height: 100%;
		}

		table,
		td {
			mso-table-lspace: 0pt;
			mso-table-rspace: 0pt;
			border-collapse: collapse !important;
			border-spacing: 0;
		}

		img {
			border: 0;
			line-height: 100%;
			outline: none;
			text-decoration: none;
			-ms-interpolation-mode: bicubic;
		}

		#outlook a {
			padding: 0;
		}

		.ReadMsgBody {
			width: 100%;
		}

		.ExternalClass {
			width: 100%;
		}

		.ExternalClass,
		.ExternalClass p,
		.ExternalClass span,
		.ExternalClass font,
		.ExternalClass td,
		.ExternalClass div {
			line-height: 100%;
		}

		/* Rounded corners for advanced mail clients only */
		@media all and (min-width: 560px) {
			.container {
				border-radius: 8px;
				-webkit-border-radius: 8px;
				-moz-border-radius: 8px;
				-khtml-border-radius: 8px;
			}
		}

		/* Set color for auto links (addresses, dates, etc.) */
		a,
		a:hover {
			color: #127DB3;
		}

		.footer a,
		.footer a:hover {
			color: #999999;
		}
	</style>

	<!-- MESSAGE SUBJECT -->
	<title>Open quote roundup</title>

</head>

<!-- BODY -->
<!-- Set message background color (twice) and text color (twice) -->

<body topmargin="0" rightmargin="0" bottommargin="0" leftmargin="0" marginwidth="0" marginheight="0" width="100%" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;
	background-color: #D5E2EC;
	color: #000000;" bgcolor="#D5E2EC" text="#303344">

	<!-- SECTION / BACKGROUND -->
	<!-- Set message background color one again -->
	<table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
		style="border-collapse: collapse; border-spacing: 0; margin-top: 30px; padding: 0; width: 100%;"
		class="background">
		<tr>
			<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; padding: 0;"
				bgcolor="#D5E2EC">

				<!-- WRAPPER -->
				<!-- Set wrapper width (twice) -->
				<table border="0" cellpadding="0" cellspacing="0" align="center" width="700" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
	max-width: 700px;" class="wrapper">

					<tr>
						<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
			padding-top: 20px;
			padding-bottom: 20px;">

							<h1>Quotation
								<h1 />
						</td>
					</tr>

					<!-- End of WRAPPER -->
				</table>

				<!-- WRAPPER / CONTEINER -->
				<!-- Set conteiner background color -->
				<table border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#FFFFFF" width="800" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit; 
	max-width: 700px;" class="container">

					<!-- HEADER -->
					<!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
					<!-- HEADER -->
					<!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
					<div style="display: flex; flex-direction: column; padding-top: 20px;width: 100%; backgroundcolor:black">
						<div style="margin-bottom: 20px;">
							<div
								style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-right: 1px solid #ccc; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">

								<div style="flex: 1; padding: 10px;">
									<p style="margin-bottom: 5px;font-size: 1.9em; text-align:center">SHIPPER</p>
									<h3 style="margin-top: 3; margin-bottom: 10px; font-size: 1.5em;">Me:Clean Scrap
										Junk</h3>
									<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">Address:Chennai</p>
									<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">
										Cell:7010669844/8939478022</p>
									<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">
										Email:cleanscrapjunk@gmail.com</p>
									<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">GSTIN:33ADJPA3181C1Z7
									</p>
								</div>
							</div>
						</div>

						<div style="margin-bottom: 20px;">
							<div
								style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">


								<div style="flex: 1; padding: 10px;">
									<p style="margin-bottom: 5px;font-size: 1.9em; text-align:center">RECEIVER</p>
									<h3 style="margin-top: 3; margin-bottom: 10px; font-size: 1.5em;">
										Name:{nameofreceiver}</h3>
									<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">
										Address:{addressofreceiver}</p>
									<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">Cell:{cell}</p>
									<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">Email:{email}</p>
									<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">GSTIN:{GSTIn}</p>
								</div>
							</div>
						</div>
					</div>


					<!-- PARAGRAPH -->
					<!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->


					<!-- LINE -->
					<!-- Set line color -->
					<tr>
						<table class="w3-table" style="padding-top:20px;margin-top:20px;margin-left:20px">
    <tr>
	<th scope="col" style="padding-bottom: 10px; padding-right: 10px;">S.No</th>
	<th scope="col" style="padding-bottom: 10px;padding-right: 10px;">Discription</th>
	<th scope="col" style="padding-bottom: 10px;padding-right: 10px;">Pieces</th>
	<th scope="col" style="padding-bottom: 10px;padding-right: 10px;">Quantity</th>
	<th scope="col" style="padding-bottom: 10px;padding-right: 10px;">Rate PerKg</th>
	<th scope="col" style="padding-bottom: 10px;padding-right: 10px;">Amount</th>

    </tr>
	{items-table}
    
    <!--<tr>
	<td style="padding: 20px 0 10px;">1</td>
	<td style="padding: 20px 0 10px;">We work with many forms of melting scrap. We may
		buy a lot of different kinds of melting scrap. We pick up your melting scraps
		from your workplace, house, or factory with only one phone call.8</td>
	<td style="padding: 20px 0 10px;">300</td>
	<td style="padding: 20px 0 10px;">400</td>
	<td style="padding: 20px 0 10px;">600</td>
	<td style="padding: 20px 0 10px;">600</td>

    </tr>
    <tr>
	<td style="padding: 20px 0 10px;">1</td>
	<td style="padding: 20px 0 10px;">We work with many forms of melting scrap. We may
		buy a lot of different kinds of melting scrap. We pick up your melting scraps
		from your workplace, house, or factory with only one phone call.8</td>
	<td style="padding: 20px 0 10px;">300</td>
	<td style="padding: 20px 0 10px;">400</td>
	<td style="padding: 20px 0 10px;">600</td>
	<td style="padding: 20px 0 10px;">600</td>

    </tr>-->
  </table>
			
	</table>
	</td>
	</tr>
	<!-- BUTTON -->
	<!-- Set button background color at TD, link/text color at A and TD, font family ("sans-serif" or "Georgia, serif") at TD. For verification codes add "letter-spacing: 5px;". Link format: http://domain.com/?utm_source={{Campaign-Source}}&utm_medium=email&utm_content={{Button-Name}}&utm_campaign={{Campaign-Name}} -->
	<!-- 	<tr>
		<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 8%; padding-right: 8%; width: 87.5%;
			padding-top: 50px;
			padding-bottom: 5px;" class="button"><a
			href="https://github.com/konsav/email-templates/" target="_blank" style="text-decoration: none;">
				<table border="0" cellpadding="0" cellspacing="0" align="center" style="width: 100%; border-collapse: collapse; border-spacing: 0; padding: 0;"><tr><td align="center" valign="middle" style="padding: 18px 24px; margin: 0; text-decoration: none; border-collapse: collapse; border-spacing: 0; border-radius: 2px; -webkit-border-radius: 2px; -moz-border-radius: 2px; -khtml-border-radius: 2px;"
					bgcolor="#4579FF"><a target="_blank" style="text-decoration: none;
					color: #FFFFFF; font-family: 'Arial', sans-serif; font-size: 18px; font-weight: 600; line-height: 120%;"
					href="https://app.attuneinsurance.com">
					Review quotes
					</a>
			</td></tr></table></a>
		</td>
	</tr> -->

	<!-- PARAGRAPH -->
	<!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
	



	<!-- End of WRAPPER -->
	</table>

	<div style="display: flex; flex-direction: column; padding-top: 20px;">
		<div style="margin-bottom: 20px;">
			<div
				style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-right: 1px solid #ccc; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">

				<div style="flex: 1; padding: 10px;">
					<p style="margin-bottom: 5px;font-size: 1.9em; text-align:center">THANK YOU FOR YOUR BUSINESS!
					</p>
					<p style="margin-top: 0; margin-bottom: 5px; font-size: 1.5em;">
					Signature / Stamp:MAANAV BOTHRA.
					</p>
					<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">Place:CHENNAI.</p>
					<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">
					Date:23-03-2024.</p>
					
				</div>
			</div>
		</div>

		<div style="margin-bottom: 20px;">
			<div
				style="display: flex; justify-content: space-between; align-items: center; width: 100%;  border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">


				<div style="flex: 1; padding: 10px;">
					<p style="margin-bottom: 5px;font-size: 1.9em; text-align:center">TOTAL AMOUNT:{totalAmount}</p>
					<h3 style="margin-top: 3; margin-bottom: 10px; font-size: 1.5em;">
					SGST @ 9%:{withsgst}
					</h3>
					<p style="margin-top: 0; margin-bottom: 5px;font-size: 1.5em;">
					CGST @9%:{withCGST}</p>
					
				</div>
			</div>
		</div>
	</div>

	<!-- WRAPPER -->
	<!-- Set wrapper width (twice) -->
	<table border="0" cellpadding="0" cellspacing="0" align="center" width="560" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
	max-width: 560px;" class="wrapper">

		<!-- FOOTER -->
		<!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
		<tr>
			<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 13px; font-weight: 400; line-height: 150%;
			padding-top: 30px;
			padding-bottom: 20px;
			color: #7d8d9e;
			font-family: 'Arial', sans-serif;" class="footer">
			NOTES:
			<br/>
				E TO LOT OF PRICE FLUCTUATIONS IN THE MARKET, WE REQUEST OUR BELOVED CUSTOMERS TO FOLLOW,

				CEPT & CO-OPERATE WITH OUR FOLLOWING REQUETS
				
				OUR QUOTATION IS VALID ONLY UPTO 16:00 HRS 23-03-2024 AND SUBJECT TO AVAILABILITY OF MATERIALS.
				
				PAYMENT MODE IMMEDIATE.
				
				SUPPLIES SHALL BE MADE SUBJECT TO 10%(+) OR (-) TO ORDER QUANTITY.

				<!-- ANALYTICS -->
				<!-- https://www.google-analytics.com/collect?v=1&tid={{UA-Tracking-ID}}&cid={{Client-ID}}&t=event&ec=email&ea=open&cs={{Campaign-Source}}&cm=email&cn={{Campaign-Name}} -->
				<img width="1" height="1" border="0" vspace="0" hspace="0"
					style="margin: 0; padding: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: block;"
					src="https://raw.githubusercontent.com/konsav/email-templates/master/images/tracker.png" />

			</td>
		</tr>

		<!-- End of WRAPPER -->
	</table>

	<!-- End of SECTION / BACKGROUND -->
	</td>
	</tr>
	</table>

</body>

</html>`